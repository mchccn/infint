/** */
interface InfIntConstructor {
    (...args: ConstructorParameters<typeof infint>): infint;
}

/** */
class infint {
    private _ = "";
    
    private negative = false;

    public constructor(n?: string | number | bigint | boolean) {
        this.n = typeof n === "undefined" ? "0" : typeof n === "boolean" ? n ? "1" : "0" : n.toString();

        Object.freeze(this);
    }

    *[Symbol.iterator](): Generator<string, void, undefined> {
        yield* this.n.split("").reverse();
    }

    [Symbol.toStringTag](): string {
        return "infint";
    }

    public toString(): string {
        return (this.negative ? "-" : "") + this.n;
    }

    public toJSON(): string {
        return (this.negative ? "-" : "") + this.n;
    }

    public toExponential(precision?: number): string {
        if (typeof precision === "number" && (precision < 0 || precision > 100)) throw new RangeError(`InfInt.prototype.toExponential precision must be between 0 and 100.`);

        return `${this.n[0]}${precision !== 0 ? "." : ""}${this.n.slice(1, typeof precision === "number" ? precision + 1 : undefined).padEnd(precision ?? 0, "0")}e${this.n.length}`;
    }

    public get isStrictlyNegative(): boolean {
        return this.n === "0" ? false : this.negative;
    }

    public get isStrictlyPositive(): boolean {
        return this.n === "0" ? false : !this.negative;
    }

    public get isNegative(): boolean {
        return this.negative;
    }

    public get isPositive(): boolean {
        return !this.negative;
    }

    public get isZero(): boolean {
        return this.n === "0";
    }

    private get n() {
        return this._;
    }

    private set n(v: string) {
        if (!/^[+-]?([0-9]|[1-9][0-9]*)$/.test(v)) throw new TypeError(`Attempted to assign InfInt a non-numerical string.`);

        if (v.startsWith("-")) this.negative = true;

        this._ = v.startsWith("-") || v.startsWith("+") ? v.slice(1) : v;
    }

    public negate(): infint {
        return InfInt((this.negative ? "" : "-") + this.n);
    }

    public add(x: infint): infint {
        if (this.isPositive && x.isNegative || this.isNegative && x.isPositive) return this.sub(x);

        if (this.isNegative && x.isNegative) return InfInt(this.n).add(InfInt(x.n)).negate();

        const a = this.n.split("").reverse().join("");
        const b = x.n.split("").reverse().join("");

        let result = "";

        let carry = 0;

        for (let i = 0; i < a.length || i < b.length; i++) {
            const c1 = i < a.length ? +a[i] : 0;
            const c2 = i < b.length ? +b[i] : 0;

            const sum = c1 + c2 + carry;
            const digit = sum % 10;

            carry = Math.floor(sum / 10);
            result = digit + result;
        }

        if (carry) result = carry + result;

        return InfInt(result);
    }

    public sub(x: infint): infint {
        if (!this.cmp(x)) return InfInt();

        let a = this.n.split("").reverse().join("");
        let b = x.n.split("").reverse().join("");

        const negate = this.cmp(x) === -1;

        if (this.isPositive && x.isPositive && this.cmp(x) === -1) [a, b] = [b, a];

        if (this.isNegative && x.isNegative && this.cmp(x) === 1) [a, b] = [b, a];

        if (this.isPositive && x.isNegative) return this.add(x.negate());

        if (this.isNegative && x.isPositive) return this.negate().add(x).negate();

        let result = "";

        let carry = 0;

        for (let i = 0; i < b.length; i++) {
            let sub = +a[i] - +b[i] - carry;

            carry = +(sub < 0);

            if (sub < 0) sub += 10;

            result += sub;
        }

        for (let i = b.length; i < a.length; i++) {
            let sub = +a[i] - carry;

            carry = +(sub < 0);

            if (sub < 0) sub += 10;

            result += sub;
        }

        result = result.split("").reverse().join("");

        while (result[0] === "0") result = result.slice(1);

        if (negate) result = "-" + result;

        return InfInt(result);
    }

    public mul(x: infint): infint {
        const sign = this.sign * x.sign;

        if (this.isZero || x.isZero) return InfInt();

        const a = this.n.split("").reverse().map((d, i) => d + "0".repeat(i));
        const b = x.n.split("").reverse().map((d, i) => d + "0".repeat(i));

        const cells = [];

        for (const d1 of a)
            for (const d2 of b)
                d1[0] === "0" || d2[0] === "0" ? void 0 : cells.push(+d1[0] * +d2[0] + d1.slice(1) + d2.slice(1));

        let result = InfInt();

        for (const s of cells) result = result.add(InfInt(s));

        return sign < 0 ? result.negate() : result;
    }

    public div(x: infint): infint {
        if (x.isZero) throw new RangeError(`Cannot divide by zero.`);

        if (this.abs().cmp(x.abs()) < 0) return InfInt();

        const sign = this.sign * x.sign;

        if (!this.cmp(x)) return sign < 0 ? InfInt("1").negate() : InfInt("1");

        if (x.n === "1") return sign < 0 ? InfInt(this.n).negate() : InfInt(this.n);

        let n = this.clone().abs();

        let m = x.clone().abs();

        const k = n.n.length;

        const l = m.n.length;

        let r = InfInt();

        let q = InfInt();

        const idiv = (n: infint, d: infint) => {
            let x = n.clone();

            let q = InfInt();

            while (x.cmp(d) >= 0) {
                x = x.sub(d);

                q = q.add(InfInt("1"));
            }

            return q;
        };

        for (let i = 0; i <= l - 2; i++) {
            r = r.add(InfInt(n.n[i] + "0".repeat(l - 2 - i)))
        }

        for (let i = 0; i <= k - l; i++) {
            const a = n.n[i + l - 1];

            const d = r.mul(InfInt("10")).add(InfInt(a));

            const b = idiv(d, m);

            r = d.sub(m.mul(b));

            q = q.mul(InfInt("10")).add(b);
        }

        return sign < 0 ? q.negate() : q;
    }

    public mod(x: infint): infint {
        if (x.isZero || this.abs().cmp(x.abs()) < 0) return this.clone();

        if (!this.cmp(x) || x.n === "1") return InfInt();

        const sign = this.sign * x.sign;

        let n = this.clone().abs();

        let m = x.clone().abs();

        const k = n.n.length;

        const l = m.n.length;

        let r = InfInt();

        let q = InfInt();

        const idiv = (n: infint, d: infint) => {
            let x = n.clone();

            let q = InfInt();

            while (x.cmp(d) >= 0) {
                x = x.sub(d);

                q = q.add(InfInt("1"));
            }

            return q;
        };

        for (let i = 0; i <= l - 2; i++) {
            r = r.add(InfInt(n.n[i] + "0".repeat(l - 2 - i)))
        }

        for (let i = 0; i <= k - l; i++) {
            const a = n.n[i + l - 1];

            const d = r.mul(InfInt("10")).add(InfInt(a));

            const b = idiv(d, m);

            r = d.sub(m.mul(b));

            q = q.mul(InfInt("10")).add(b);
        }

        return sign < 0 ? r.negate() : r;
    }

    public exp(x: infint): infint {
        if (x.isZero) return InfInt("1");

        if (x.n === "1") return this.clone();

        const sign = this.sign * (+x.n[x.n.length - 1] % 2 === 0 ? 1 : -1);

        let n = InfInt(x.n);

        let m = InfInt(this.n);

        let y = InfInt("1");

        while (n.cmp(InfInt("1")) > 0) {
            if (+n.n[n.n.length - 1] % 2 === 0) {
                m = m.mul(m);
                n = n.div(InfInt("2"));
            } else {
                y = m.mul(y);
                m = m.mul(m);
                n = n.sub(InfInt("1")).div(InfInt("2"));
            }
        }

        return sign < 0 ? m.mul(y) : m.mul(y);
    }

    public root(x: infint): infint {
        if (!x.isStrictlyPositive) throw new RangeError(`Root index must be a positive.`);
        
        const c = [];

        for (let i = this.n.length; i >= 0; i -= +x.n) this.n.substring(i - +x.n, i) ? c.unshift(this.n.substring(i - +x.n, i).replace(/^0*(\d+)$/, "$1")) : void 0;

        const f = c.shift();

        let y = InfInt();

        while (y.exp(x).cmp(InfInt(f)) <= 0) y = y.add(InfInt("1"));

        y = y.sub(InfInt("1"));

        let r = InfInt(f).sub(y.exp(x));

        let b = y.clone();

        for (const a of c) {
            for (let i = 0; i < 10; i++)
                if (InfInt("10").mul(y).add(InfInt(i)).exp(x).sub(InfInt("10").exp(x).mul(y.exp(x))).cmp(InfInt("10").exp(x).mul(r).add(InfInt(a))) > 0) {
                    b = InfInt(i - 1);
                    break;
                }

            const yp = InfInt("10").mul(y).add(b);

            const rp = InfInt("10").exp(x).mul(r).add(InfInt(a)).sub(yp.exp(x).sub(InfInt("10").exp(x).mul(y.exp(x))));

            y = yp;

            r = rp;
        }

        return y;
    }

    public gcd(x: infint): infint {
        if (this.isZero) return x.clone();

        let a = this.clone();
        let b = x.clone();

        while (!b.isZero) {
            if (a.cmp(b) > 0) {
                a = a.sub(b);
            }  else {
                b = b.sub(a);
            }
        }

        return a;
    }

    public lcm(x: infint): infint {
        return this.mul(x).div(this.gcd(x));
    }

    public cmp(x: infint): -1 | 0 | 1 {
        const a = this.n.length;
        const b = x.n.length;

        if (this.isNegative && x.isPositive) return -1;

        if (this.isPositive && x.isNegative) return 1;

        if (this.isNegative && x.isNegative) {
            if (a > b) return -1;

            if (a < b) return 1;

            if (this.n > x.n) return -1;

            if (this.n < x.n) return 1;
        }

        if (this.isPositive && x.isPositive) {
            if (a > b) return 1;

            if (a < b) return -1;

            if (this.n > x.n) return 1;

            if (this.n < x.n) return -1;
        }

        return 0;
    }

    public abs(): infint {
        return InfInt(this.n);
    }

    public clone(): infint {
        return InfInt(this.toString());
    }

    public get strictSign(): -1 | 0 | 1 {
        return this.n === "0" ? 0 : this.sign;
    }

    public get sign(): -1 | 1 {
        return this.negative ? -1 : 1;
    }
}

/** */
const InfInt: InfIntConstructor = (...args: ConstructorParameters<typeof infint>) => new infint(...args);

export { InfInt };
export default InfInt;
