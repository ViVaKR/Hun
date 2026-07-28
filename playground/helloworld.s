.global  _start
.p2align 2

_start:
	b _printf
	b _terminate

_printf:
	mov X0, #1              // stdout
	adr X1, helloworld      // address of 'Hello, World' string
	mov X2, #13             // length of 'Hello, World' string (13)
	mov X16, #4             // write to stdout
	svc 0                   // syscall

_reboot:
	mov X0, #1      // instant reboot
	mov X16, #55    // reboot
	svc 0           // syscall

_terminate:
	mov X0, #0      // return 0
	mov X16, #1     // terminate
	svc 0           // syscall

// hello world string
helloworld: .ascii "Hello, World\n" // 13 char
