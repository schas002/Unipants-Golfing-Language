# Unipants' Golfing Language

Unipants' Golfing Language (TODO: choose a better name) is a language inspired by [Shifty Eyes](https://gist.github.com/schas002/03da208c75b79aa0125edc7935f143a7).

## Instructions

### I/O

- `i` - input an integer into the stack

- `I` - input a character into the stack

- `o` - pop the top of stack and output an integer

- `O` - pop the top of stack and output a character

### Push/Pop

- `c` - push a 0 into the stack

- `_` - DROP the top of stack

### Increment/Decrement

- `u` - increment the top of stack

- `d` - decrement the top of stack

### Arithmetic

- `+` - add the top of stack and second-to-top of stack

- `-` - subtract from the top of stack the second-to-top of stack

- `*` - multiply the top of stack and second-to-top of stack

- `/` - divide the top of stack by second-to-top of stack

### Stack Primitives

- `$` - DUP - push a copy of the top of stack (1 2 ==> 1 2 2)

- `%` - SWAP - swap the top of stack and second-to-top of stack (1 2 3 ==> 1 3 2)

- `@` - ROLL - roll the stack upward (1 2 3 4 ==> 4 1 2 3)

- `^` - PICK - push a copy of the second-to-top of stack (1 2 ==> 1 2 1)

### Nested Structures

- `?` - if: the nested structure runs if and only if the top of stack is nonzero

- `l` - while: the nested structure runs while the top of stack is nonzero

- `:` ends both nested structures.

### Example

Counts down from n to 1.

```
il$od:
i      - input
 l   : - while loop
  $    - dup
   o   - output
    d  - decrement
```