// symbol-index.js
// -----------------------------------------------------------------------
// 목적: 프로젝트 전체(.S/.s/.asm/.inc)의 라벨/함수 정의를 메모리에 인덱싱해서
//       자동완성 / F12 정의이동 / Ctrl+T 전역 심볼검색이 전부 "즉시 조회"만
//       하면 되도록 만드는 단일 진실 공급원.
//
// 왜 필요한가:
//   - extension.js의 기존 F12(Definition)는 클릭할 때마다 findFiles로 최대
//     300개 파일을 매번 새로 열어서 처음부터 다시 훑는다. 파일이 많아지면
//     느려질 수밖에 없는 구조.
//   - 자동완성(Completion)은 아예 현재 열린 파일 안에서만 라벨을 찾고 있어서
//     "다른 파일에 이미 정의해둔 함수"가 인텔리센스에 안 뜬다.
//
// 해법: "한 번 스캔해서 메모리에 올려두고, 파일이 바뀔 때만 그 부분만 다시
//   스캔"하는 인덱스 하나를 만들어서 세 기능이 전부 이걸 조회만 하게 한다.
//   (진짜 Language Server들이 쓰는 표준 패턴 — 다만 여긴 훨씬 가벼운 버전)
// -----------------------------------------------------------------------

const vscode = require('vscode');

// extension.js의 LABEL_DEF_RE와 반드시 동일하게 유지할 것
// (한글 라벨 + .L_ 로컬 라벨 전부 포획)
const LABEL_DEF_RE = /^\s*([\p{L}_.$][\p{L}0-9_.$]*)\s*:/u;

const FILE_GLOB = '**/*.{s,S,asm,inc}';
const EXCLUDE_GLOB = '**/{node_modules,build,out,.git}/**';

/**
 * @typedef {{ uri: vscode.Uri, position: vscode.Position }} SymbolLocation
 */

function createSymbolIndex() {
  /** @type {Map<string, SymbolLocation[]>} 라벨이름 -> 정의 위치 목록 (동명이인 대비 배열) */
  const nameToLocations = new Map();
  /** @type {Map<string, Set<string>>} 파일uri문자열 -> 그 파일이 등록해둔 라벨이름 집합 (파일 삭제/변경 시 깔끔히 지우려고) */
  const fileToNames = new Map();

  function addEntry(name, uri, position) {
    if (!nameToLocations.has(name)) nameToLocations.set(name, []);
    nameToLocations.get(name).push({ uri, position });

    const key = uri.toString();
    if (!fileToNames.has(key)) fileToNames.set(key, new Set());
    fileToNames.get(key).add(name);
  }

  // 해당 파일이 예전에 등록해둔 항목들을 인덱스에서 깨끗이 제거 (재스캔 전 필수)
  function clearFile(uri) {
    const key = uri.toString();
    const names = fileToNames.get(key);
    if (!names) return;
    for (const name of names) {
      const locs = nameToLocations.get(name);
      if (!locs) continue;
      const filtered = locs.filter((l) => l.uri.toString() !== key);
      if (filtered.length > 0) nameToLocations.set(name, filtered);
      else nameToLocations.delete(name);
    }
    fileToNames.delete(key);
  }

  async function readFileText(uri) {
    const bytes = await vscode.workspace.fs.readFile(uri);
    return new TextDecoder('utf-8').decode(bytes);
  }

  // 파일 하나를 (재)스캔해서 인덱스를 최신 상태로 맞춘다.
  async function indexFile(uri) {
    clearFile(uri);
    let text;
    try {
      text = await readFileText(uri);
    } catch {
      return; // 읽기 실패(삭제 직후 등)는 조용히 패스
    }

    const lines = text.split(/\r\n|\n/);
    for (let i = 0; i < lines.length; i++) {
      const m = LABEL_DEF_RE.exec(lines[i]);
      if (!m) continue;
      const name = m[1];
      const col = lines[i].indexOf(name);
      addEntry(name, uri, new vscode.Position(i, col));
    }
  }

  async function scanWorkspace() {
    const files = await vscode.workspace.findFiles(FILE_GLOB, EXCLUDE_GLOB);
    // 동시에 너무 많이 열지 않도록 적당히 나눠서 처리 (수백 개 파일도 안전하게)
    const BATCH = 20;
    for (let i = 0; i < files.length; i += BATCH) {
      await Promise.all(files.slice(i, i + BATCH).map(indexFile));
    }
    console.log(`[hun-asm] 심볼 인덱스 구축 완료 — 라벨 ${nameToLocations.size}개, 파일 ${files.length}개`);
  }

  function removeFile(uri) {
    clearFile(uri);
  }

  /** @returns {SymbolLocation[]} */
  function getDefinitions(name) {
    return nameToLocations.get(name) || [];
  }

  /** @returns {Array<{ name: string, locations: SymbolLocation[] }>} */
  function getAllSymbols() {
    return Array.from(nameToLocations.entries()).map(([name, locations]) => ({ name, locations }));
  }

  // 파일 생성/변경/삭제를 실시간으로 감시해서 인덱스를 증분 갱신
  function watch(context) {
    const watcher = vscode.workspace.createFileSystemWatcher(FILE_GLOB);
    watcher.onDidChange(indexFile);
    watcher.onDidCreate(indexFile);
    watcher.onDidDelete(removeFile);
    context.subscriptions.push(watcher);
    return watcher;
  }

  return { scanWorkspace, watch, getDefinitions, getAllSymbols, indexFile, removeFile };
}

module.exports = { createSymbolIndex, LABEL_DEF_RE };
