import { useState, useCallback } from "react";
import mysticStoneImg from "@/assets/mystic-stone.png";
import darkenedStoneImg from "@/assets/darkened-stone.png";
import dsIcon from "@/assets/ds-icon.png";
import clanCoinImg from "@/assets/clan-coin.png";
import goldImg from "@/assets/gold-icon.png";

type StoneType = "mystic" | "darkened";
type InputMode = "ds" | "stone";

const STONE_DATA = {
  mystic: { price: 2000, clanCoins: 160, name: "Mystic Stone", nameTh: "หินลึกลับ", img: mysticStoneImg },
  darkened: { price: 4500, clanCoins: 375, name: "Darkened Stone", nameTh: "หินมืด", img: darkenedStoneImg },
};

function formatNumber(num: number) {
  return num.toLocaleString();
}

export default function StoneCalculator() {
  const [stone, setStone] = useState<StoneType>("mystic");
  const [inputMode, setInputMode] = useState<InputMode>("ds");
  const [dsValue, setDsValue] = useState("");
  const [stoneCount, setStoneCount] = useState("");
  const [taxEnabled, setTaxEnabled] = useState(true);
  const [result, setResult] = useState<null | {
    stones: number;
    taxAmount: number;
    goldCost: number;
    clanCoins: number;
    dsNeeded: number;
  }>(null);

  const data = STONE_DATA[stone];

  const parseNum = (v: string) => parseInt(v.replace(/,/g, "")) || 0;

  const handleDsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setDsValue(raw ? parseInt(raw).toLocaleString() : "");
  };

  const handleStoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setStoneCount(raw ? parseInt(raw).toLocaleString() : "");
  };

  const calculate = useCallback(() => {
    if (inputMode === "ds") {
      const totalDS = parseNum(dsValue);
      if (totalDS <= 0) return;

      const taxRate = taxEnabled ? 0.3 : 0;
      const taxAmount = Math.floor(totalDS * taxRate);
      const remaining = totalDS - taxAmount;
      const stones = Math.floor(remaining / data.price);
      const goldCost = taxEnabled ? Math.ceil(taxAmount / 100000) : 0;
      const clanCoins = stones * data.clanCoins;

      setResult({ stones, taxAmount, goldCost, clanCoins, dsNeeded: totalDS });
    } else {
      const wantedStones = parseNum(stoneCount);
      if (wantedStones <= 0) return;

      const dsForStones = wantedStones * data.price;
      // If tax enabled, we need to find total DS such that after 30% tax, remaining >= dsForStones
      // remaining = totalDS * 0.7 >= dsForStones → totalDS = ceil(dsForStones / 0.7)
      const totalDS = taxEnabled ? Math.ceil(dsForStones / 0.7) : dsForStones;
      const taxAmount = taxEnabled ? Math.floor(totalDS * 0.3) : 0;
      const goldCost = taxEnabled ? Math.ceil(taxAmount / 100000) : 0;
      const clanCoins = wantedStones * data.clanCoins;

      setResult({ stones: wantedStones, taxAmount, goldCost, clanCoins, dsNeeded: totalDS });
    }
  }, [inputMode, dsValue, stoneCount, taxEnabled, data]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 sm:p-8 w-full max-w-md space-y-6 glow-gold">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-gradient-gold">
          Stone Purchase Calculator
        </h1>

        {/* Stone Selection */}
        <div className="grid grid-cols-2 gap-3">
          {(["mystic", "darkened"] as const).map((type) => {
            const s = STONE_DATA[type];
            const selected = stone === type;
            return (
              <button
                key={type}
                onClick={() => { setStone(type); setResult(null); }}
                className={`relative rounded-xl p-4 text-center transition-all duration-300 cursor-pointer border-2 ${
                  selected
                    ? "border-primary bg-secondary/60 shadow-lg shadow-primary/20 scale-[1.02]"
                    : "border-border bg-muted/30 hover:border-muted-foreground/40 hover:bg-muted/50"
                }`}
              >
                <img src={s.img} alt={s.name} className="w-16 h-16 mx-auto mb-2 drop-shadow-lg" width={64} height={64} />
                <p className={`font-semibold text-sm ${selected ? "text-primary" : "text-foreground"}`}>{s.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatNumber(s.price)} DS</p>
              </button>
            );
          })}
        </div>

        {/* Input Mode Toggle */}
        <div className="flex rounded-lg overflow-hidden border border-border">
          {(["ds", "stone"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setInputMode(mode); setResult(null); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                inputMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
              }`}
            >
              {mode === "ds" ? "กรอก DS" : "กรอกจำนวนหิน"}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="space-y-3">
          {inputMode === "ds" ? (
            <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3 border border-border focus-within:border-primary transition-colors">
              <img src={dsIcon} alt="DS" className="w-8 h-8" width={32} height={32} />
              <input
                type="text"
                value={dsValue}
                onChange={handleDsInput}
                placeholder="จำนวน DS ที่มี"
                className="flex-1 bg-transparent outline-none text-foreground text-lg font-medium placeholder:text-muted-foreground"
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3 border border-border focus-within:border-primary transition-colors">
              <img src={data.img} alt={data.name} className="w-8 h-8" width={32} height={32} />
              <input
                type="text"
                value={stoneCount}
                onChange={handleStoneInput}
                placeholder={`จำนวน ${data.nameTh} ที่ต้องการ`}
                className="flex-1 bg-transparent outline-none text-foreground text-lg font-medium placeholder:text-muted-foreground"
              />
            </div>
          )}

          {/* Tax Toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setTaxEnabled(!taxEnabled)}
              className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                taxEnabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-primary-foreground transition-transform duration-200 ${
                  taxEnabled ? "translate-x-5" : ""
                }`}
              />
            </div>
            <span className="text-sm text-secondary-foreground">หักภาษี 30%</span>
          </label>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculate}
          className="w-full py-3.5 rounded-xl font-bold text-lg transition-all duration-300 cursor-pointer"
          style={{
            background: "var(--gradient-gold)",
            color: "hsl(var(--primary-foreground))",
          }}
        >
          คำนวณ
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-lg font-bold text-gradient-gold text-center">ผลลัพธ์</h3>

            <ResultRow icon={data.img} label={data.nameTh} value={`${formatNumber(result.stones)} ก้อน`} />

            {inputMode === "stone" && (
              <ResultRow icon={dsIcon} label="DS ที่ต้องใช้ทั้งหมด" value={`${formatNumber(result.dsNeeded)} DS`} />
            )}

            <ResultRow
              icon={dsIcon}
              label={taxEnabled ? "หักภาษี 30%" : "ไม่มีการหักภาษี"}
              value={taxEnabled ? `${formatNumber(result.taxAmount)} DS` : "-"}
            />

            <ResultRow
              icon={goldImg}
              label="ทองจ่ายค่าภาษี"
              value={taxEnabled && result.goldCost > 0 ? `${formatNumber(result.goldCost)} Gold` : "-"}
            />

            <ResultRow
              icon={clanCoinImg}
              label="เหรียญแคลนที่ต้องใช้"
              value={`${formatNumber(result.clanCoins)} Coins`}
              highlight
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ResultRow({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${highlight ? "bg-primary/10 border border-primary/30" : "bg-muted/30 border border-border"}`}>
      <img src={icon} alt="" className="w-7 h-7" width={28} height={28} loading="lazy" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`font-bold text-sm ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
      </div>
    </div>
  );
}
