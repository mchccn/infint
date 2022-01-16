# `infint`

```
Lightning-fast arbitrary precision integers using strings + walkthrough and explanation.

Supported operations:

- Addition
- Subtraction
- Multiplication
- Exponentiation
- Division
- Modulo
- Greatest common divisor
- Least common multiple
- N-th root

Algorithms used:

- Grade-school addition
- Grade-school subtraction
- Grid multiplication
- Exponentiation by squaring
- Long division
- Long division with remainder
- Euclidean algorithm
- Derived by definition
- Shifting n-th root algorithm

```

```
/**
 * ---------------------------------------------------------
 *   I N F I N I T E   P R E C I S I O N   I N T E G E R S
 * ---------------------------------------------------------
 * 
 * = A b o u t =============================================
 * 
 * In the olden days of JavaScript, we were limited by
 * only the precision of extremely large numbers. Either
 * sacrifice accuracy for convenience, or sacrifice
 * convenience for accuracy. Now that we have BigInt and
 * a plethora of libraries for arbitrary precision
 * numbers, it is a rather trivial problem.
 * 
 * So why re-invent the wheel and write another library
 * to implement arbitrary precision in JavaScript?
 * 
 * First, this is strictly only integers. There is no
 * support for decimals and fractions. Because it is
 * strictly integers it will be slightly faster than
 * implementations supporting other types of numbers.
 * 
 * Second, it uses modern language features with
 * TypeScript, unlike some other libraries written
 * with the unfriendly var keyword.
 * 
 * Third, this also supports other common operations, not
 * just simple grade school arithmetic. Note that these
 * are naturally more computationally expensive.
 * 
 * Fourth, the implementation uses fast algorithms
 * and is fast enough for most applications
 * using arbitrary precision integers. Some aspects
 * of the algorithms have been replaced by slower
 * alternatives for readability and to follow the
 * notes below.
 * 
 * Enjoy true infinite precision integers now.
 * 
 * = N o t e s =============================================
 * 
 * Addition is rather trivial if we only consider positive 
 * integers. However, if we want to support negative
 * integers then implementing proper subtraction would
 * greatly reduce the effort required.
 * 
 * Subtraction is also trivial, but not as trivial, if 
 * we only consider positive integers, and the minuend is 
 * greater than the subtrahend.
 * 
 * The complicated part of true subtraction is that
 * the signs of the numbers influence the sign of the
 * output. This can be easily simplified because of
 * how subtraction can be thought of as adding a 
 * negative number.
 * 
 * And so we list all possible cases:
 * 
 *   a > b & +a +b => a - b      |  22 - 13  => 22 - 13
 *   a < b & +a +b => -(b - a)   |  13 - 22  => -(22 - 13)
 *   - - - & +a -b => a + b      |  13 - -22 => 13 + 22
 *   - - - & -a +b => -(-a + b)  | -13 - 22  => -(13 + 22)
 *   a > b & -a -b => b - a      | -13 - -22 => 22 - 13
 *   a < b & -a -b => -(-a - -b) | -22 - -13 => -(22 - 13)
 * 
 * After implementing all the cases and then simplifying
 * the resulting code greatly, we now have true subtraction
 * which supports both negative and positive numbers.
 * 
 * For multiplication we will use the extremely simple
 * grid method, in which you split up the multiplicand and
 * multiplier into their respective place values and align
 * them on a grid, like so:
 * 
 *   +-----+-----+-----+
 *   | xxx |  20 |   2 |
 *   +-----+-----+-----+
 *   |  10 | 200 |  20 |
 *   +-----+-----+-----+
 *   |   3 |  60 |   6 |
 *   +-----+-----+-----+
 * 
 * Then it's just an addition of all the cells in the grid.
 * This should be slightly faster and easier to implement
 * than traditional grade school multiplication.
 * 
 * The only expensive computation here is the splitting and
 * finding combonations of the place values.
 * 
 * Now for the inverse of multiplication, division.
 * 
 * Since we are using only integers, we are going to
 * implement integer division. The simplest way to implement
 * unsigned integer division would be a while loop with
 * repeated subtraction.
 * 
 * Obviously because we are dealing with extremely large
 * numbers, this would be too slow to perform.
 * 
 * Instead we will vie for a simple implementation
 * of traditional long division. Here is our example:
 * 
 *      +------
 *   13 | 2213
 * 
 * We first need to take the first two digits of the dividend
 * because the divisor is two digits.
 * Then we check if the divisor is greater than the two digits.
 * 
 * In this case it isn't, so we are free to continue. Next,
 * we use naive integer division because it will not be slow
 * when used with operands of similar magnitude.
 * 
 * With our example, we get the quotient 1:
 * 
 *        1
 *      +------
 *   13 | 2213
 * 
 * And then we subtract 13 from the two digits, but what
 * that is actually doing is subtracting 1300 from the entire
 * dividend.
 * 
 *        1
 *      +------
 *   13 | 2213
 *      - 1300
 *         913
 * 
 * We then repeat these steps with our new dividend.
 * 
 *        17
 *      +------
 *   13 | 2213
 *      - 1300
 *         913
 *      -  910
 *           3
 * 
 * One step later and we have another dividend. However,
 * this time, the dividend is smaller than the divisor,
 * which marks the end of division. 
 * 
 * Our quotient is left, 17, and we can clearly see that
 * the remainder is 3.
 * 
 * With division, we can now easily implement modulo.
 * 
 * The code is exactly the same, but with a few different
 * edge cases to check for at the beginning. Note that 
 * we could also instead use an efficient modulus 
 * algorithm, but for the sake of brevity it is not 
 * used.
 * 
 * Exponentiation is next. A naive implementation might 
 * use a loop and multiply the number by itself inside
 * the loop. Remember that we are using arbitrary
 * precision integers and that the integers will be
 * extremely large.
 * 
 * So, we cannot use a plain loop. The optimization we 
 * observe and utilize is exponentiation by squaring.
 * 
 * The core concept is that:
 * 
 *   if x is even
 *     
 *     a^x = a^(x / 2) * a^(x / 2)
 * 
 *   if x is odd 
 * 
 *     a^x = a^((x - 1) / 2) * a^((x - 1) / 2) * a
 * 
 * Because we are squaring, we need less computations
 * to find the result. For example, if 36 was x and
 * 2 was the base:
 * 
 *   36 is even 
 * 
 *   2^36 = 2^18 * 2^18
 * 
 *   18 is even
 *  
 *   2^18 = 2^9 * 2^9
 * 
 *   9 is odd 
 * 
 *   2^9 = 2^4 * 2^4 * 2
 *   
 *   4 is even
 * 
 *   2^4 = 2^2 * 2^2
 * 
 *   2 is even 
 * 
 *   2^2 = 2^1 * 2^1
 * 
 * Compared to 36 multiplications with the simple loop,
 * exponentiation by squaring is considerably more 
 * efficient.
 * 
 * The next functions we will implement are lcm and gcd,
 * more commonly known as least common multiple and 
 * greatest common divisior.
 * 
 * Since lcm can be computed much more easily using gcd,
 * we will implement gcd first. It is common knowledge 
 * that Euclid's algorithm is quite fast and easy to 
 * implment, so that is what we will use. 
 * 
 * Now that we can use the gcd function, we can compute 
 * the least common multiple as follows:
 * 
 *   lcm(a, b) = a * b / gcd(a, b)
 * 
 * Which should be trivial to write code for.
 * 
 * Finally, we have our roots to calculate. Because there
 * is a general algorithm to get the nth root, we will 
 * instead implement the algorithm, named the shifting
 * nth root algorithm.
 * 
 * Even if we are using an algorithm for all indices,
 * it is worth to take note of the Newton-Raphson
 * method to approximate roots very closely, although 
 * it does not work well for larger indices as it becomes
 * harder to find an initial guess that will require
 * little iterations.
 * 
 * This last algorithm is quite long and requires rather
 * more number theory and mathematics, so be prepared.
 * 
 * We first define a few variables: let n be the degree
 * of the root, x be the radicand, y be the root, and 
 * r be the remainder.
 * 
 * Let x' be the value of x in the next iteration,
 * and y' and r' in the same manner.
 * 
 * Now for the actual algorithm. Split the radicand
 * into chunks of digits, each with the length as the 
 * degree of the root. Align the chunks so that the 
 * decimal place is between them. 
 * 
 * Take the first chunk, alpha, and find beta, so that
 * 
 *   beta ^ n <= alpha
 * 
 * Then set y equal to beta, and r to
 *   
 *   alpha - beta ^ n
 * 
 * beause it is the remainder.
 * 
 * You an think of this as a very general approximation
 * of the root. The next step is to iterate over each 
 * of the remaining chunks, where each chunk will be 
 * henceforth referred to as alpha.
 * 
 * Find beta such that
 * 
 *   (10 ^ y + beta) ^ n - 10 ^ n * y ^ x <= 10 ^ n * r + alpha
 * 
 * This will give us the next digit of the root, beta.
 * So in the next iteration, we will append our newfound 
 * digit to the answer.
 * 
 *   y' = 10 ^ y + beta
 *
 *   r' = 10 ^ n * r + alpha - (y' ^ x - 10 ^ x * y ^ x)
 *
 * And we also calculate the new remainder to be used for the 
 * next iteration. Now before the next iteration, we update 
 * the values of y and r with y' and r', respectively.
 * 
 * Repeat this process until you have reached the desired
 * precision or when you have iterated through all chunks.
 * 
 * This algorithm is easy enough to implement with our existing
 * operations from above.
 * 
 * = C r e d i t s =========================================
 * 
 * "Give credit where credit is due."
 * 
 * https://en.wikipedia.org/wiki/Arbitrary-precision_arithmetic
 * 
 * https://cheonhyangzhang.gitbooks.io/leetcode-solutions/content/415-add-strings.html
 * https://www.geeksforgeeks.org/sum-two-large-numbers/
 * 
 * https://stackoverflow.com/questions/40708444/add-or-subtract-two-numbers-represented-as-strings-without-using-int-double-lo
 * https://www.geeksforgeeks.org/difference-of-two-large-numbers/
 *
 * https://en.wikipedia.org/wiki/Multiplication_algorithm
 * 
 * https://en.wikipedia.org/wiki/Division_algorithm
 * https://en.wikipedia.org/wiki/Long_division
 * 
 * https://en.wikipedia.org/wiki/Euclidean_algorithm 
 *
 * https://stackoverflow.com/questions/101439/the-most-efficient-way-to-implement-an-integer-based-power-function-powint-int
 * https://en.wikipedia.org/wiki/Exponentiation_by_squaring
 * 
 * https://en.wikipedia.org/wiki/Nth_root
 * https://stackoverflow.com/questions/20730053/algorithm-to-find-nth-root-of-a-number
 * https://en.wikipedia.org/wiki/Shifting_nth_root_algorithm
 * https://math.stackexchange.com/questions/1066790/shifting-nth-root-algorithm
 */
 ```
