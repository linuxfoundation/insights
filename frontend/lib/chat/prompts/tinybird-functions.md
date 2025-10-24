# Tinybird SQL Function Reference

This is an EXHAUSTIVE list of available functions in Tinybird SQL. Only use functions listed here.

## Aggregate Functions

count(), avg(), sum(), min(), max(), argMin(), argMax(), any(), anyLast(),
stddevPop(), stddevSamp(), varPop(), varSamp(), corr(), covarPop(), covarSamp(),
groupArray(), groupUniqArray(), groupBitmap(), uniq(), uniqExact(), uniqHLL12(),
median(), quantile(), quantileExact(), quantileTiming()

## String Functions

length(), empty(), notEmpty(), lower(), upper(), lowerUTF8(), upperUTF8(),
reverse(), reverseUTF8(), concat(), substring(), substringUTF8(),
trim(), trimLeft(), trimRight(), trimBoth(), startsWith(), endsWith(),
replace(), replaceAll(), replaceOne(), position(), positionCaseInsensitive(),
match(), extract(), extractAll(), like(), notLike(), ilike(), notILike(),
splitByChar(), splitByString(), arrayStringConcat(), format()

## Date/Time Functions

now(), today(), yesterday(), toYear(), toMonth(), toDayOfMonth(), toDayOfWeek(),
toHour(), toMinute(), toSecond(), toStartOfYear(), toStartOfMonth(), toStartOfDay(),
toStartOfHour(), toStartOfMinute(), toMonday(), toDate(), toDateTime(),
formatDateTime(), dateDiff(), dateAdd(), dateSub(), addDays(), addMonths(),
addYears(), subtractDays(), subtractMonths(), subtractYears()

## Math Functions

abs(), round(), floor(), ceil(), trunc(), sqrt(), cbrt(), exp(), log(), log2(),
log10(), sin(), cos(), tan(), asin(), acos(), atan(), pow(), pi(), e(),
greatest(), least(), max2(), min2()

## Type Conversion Functions

toString(), toInt32(), toInt64(), toUInt32(), toUInt64(), toFloat32(), toFloat64(),
toDate(), toDateTime(), toDecimal32(), toDecimal64(), toDecimal128(),
CAST(x AS type)

## Conditional Functions

if(cond, then, else), multiIf(), case when...then...else...end

## Array Functions

length(), empty(), notEmpty(), arrayElement(), has(), hasAll(), hasAny(),
indexOf(), arrayCount(), arraySum(), arrayAvg(), arrayMin(), arrayMax(),
arrayUniq(), arrayJoin(), arrayConcat(), arraySlice(), arraySort(), arrayReverse()

## Window Functions

row_number(), rank(), dense_rank(), percent_rank(),
lagInFrame(x[, offset[, default]]), leadInFrame(x[, offset[, default]]),
first_value(x), last_value(x), nth_value(x, offset)

**Note:** Use lagInFrame() instead of LAG(), leadInFrame() instead of LEAD()

## JSON Functions (if table has JSON columns)

JSONExtract(), JSONExtractString(), JSONExtractInt(), JSONExtractFloat(),
JSONExtractBool(), JSONExtractArrayRaw(), JSONHas(), JSONLength()

## Supported Data Types

**Numeric Types:**

- Integers: Int8, Int16, Int32, Int64, Int128, Int256
- Unsigned: UInt8, UInt16, UInt32, UInt64, UInt128, UInt256
- Float: Float32, Float64
- Decimal: Decimal(P,S), Decimal32(S), Decimal64(S), Decimal128(S), Decimal256(S)

**String Types:**

- String (variable-length)
- FixedString(N) (fixed-length)

**Date/Time Types:**

- Date, Date32
- DateTime([timezone]), DateTime64(precision, [timezone])

**Other Types:**

- Bool
- UUID
- Array(T)
- Map(K,V)
- Nullable(T)
- LowCardinality(T)
- JSON (private beta - DO NOT USE)
