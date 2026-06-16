import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// ─── PIN CONFIG ───────────────────────────────────────────────────────────────
// Cambiá este PIN antes de subir
const CORRECT_PIN = "2810"
const SESSION_KEY = "casahub_auth"

// ─── PIN SCREEN ───────────────────────────────────────────────────────────────
function PinScreen({ onUnlock }) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleDigit = (d) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError(false)
    if (next.length === 4) {
      if (next === CORRECT_PIN) {
        sessionStorage.setItem(SESSION_KEY, "1")
        onUnlock()
      } else {
        setShake(true)
        setError(true)
        setTimeout(() => { setPin(""); setShake(false) }, 600)
      }
    }
  }

  const handleDel = () => { setPin(p => p.slice(0, -1)); setError(false) }

  const digits = ["1","2","3","4","5","6","7","8","9","","0","⌫"]

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
      fontFamily:"'Inter',system-ui,sans-serif", padding:24
    }}>
      <div style={{fontSize:40, marginBottom:8}}>🏠</div>
      <div style={{fontSize:22, fontWeight:800, color:"#fff", marginBottom:4}}>Casa Hub</div>
      <div style={{fontSize:14, color:"rgba(255,255,255,.7)", marginBottom:40}}>Ingresá tu PIN</div>

      {/* Dots */}
      <div style={{
        display:"flex", gap:16, marginBottom:40,
        animation: shake ? "shake .4s ease" : "none"
      }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width:16, height:16, borderRadius:"50%",
            background: i < pin.length
              ? (error ? "#ef4444" : "#fff")
              : "rgba(255,255,255,.3)",
            transition:"background .15s, transform .15s",
            transform: i < pin.length ? "scale(1.2)" : "scale(1)"
          }}/>
        ))}
      </div>

      {/* Keypad */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, width:240}}>
        {digits.map((d, i) => (
          d === "" ? <div key={i}/> :
          <button key={i}
            onClick={() => d === "⌫" ? handleDel() : handleDigit(d)}
            style={{
              height:64, borderRadius:16,
              background: d === "⌫" ? "rgba(255,255,255,.15)" : "rgba(255,255,255,.2)",
              border:"none", cursor:"pointer", fontSize: d === "⌫" ? 20 : 22,
              fontWeight:700, color:"#fff", fontFamily:"inherit",
              backdropFilter:"blur(10px)",
              transition:"transform .1s, background .1s",
              WebkitTapHighlightColor:"transparent"
            }}
            onMouseDown={e => e.currentTarget.style.transform = "scale(.93)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            onTouchStart={e => e.currentTarget.style.transform = "scale(.93)"}
            onTouchEnd={e => e.currentTarget.style.transform = "scale(1)"}
          >{d}</button>
        ))}
      </div>

      {error && (
        <div style={{marginTop:24, color:"#fca5a5", fontSize:13, fontWeight:600}}>
          PIN incorrecto, intentá de nuevo
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
      `}</style>
    </div>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
function Root() {
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem(SESSION_KEY) === "1"
  )
  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />
  return <App />
}

createRoot(document.getElementById('root')).render(<Root />)
