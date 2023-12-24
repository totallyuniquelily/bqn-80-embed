// Assumes bqn.js has already been loaded
const source = document.getElementById("source")
const error = document.getElementById("error")
const ctx = document.getElementById("canvas").getContext('2d')
ctx.fillRect(0,0,240,136)
const img = ctx.getImageData(0,0,240,136)

const palette = [
    "#1a1c2c",
    "#5d275d",
    "#b13e53",
    "#ef7d57",
    "#ffcd75",
    "#a7f070",
    "#38b764",
    "#257179",
    "#29366f",
    "#3b5dc9",
    "#41a6f6",
    "#73eff7",
    "#f4f4f4",
    "#94b0c2",
    "#566c86",
    "#333c57",
].map(v => [16,8,0].map(b => parseInt(v.slice(1), 16)>>b & 0xff))

let handle = null
let t = 0
let f
let frame

function stop() {
    if (handle) {
        clearInterval(handle)
        handle = null
    }
}
function reset() {
    stop()
    error.innerText = ""
    t = 0
    frame = run.apply(null, compile("136‿240⥊0"))
}
let lastFrametime = 0
function update() {
    const start = Date.now()
    try {
        frame = f(frame, t++)
    } catch(e) {
        error.innerText = fmtErr(e)
        stop()
    }
    for (i = 0; i < Math.min(frame.length, 240*136); i++) {
        v = frame[i] & 0x0f
        c = palette[v]
        img.data[i*4] = c[0]
        img.data[i*4+1] = c[1]
        img.data[i*4+2] = c[2]
        //img.data[i*4+3] = 255
    }
    ctx.putImageData(img, 0, 0)
    const end = Date.now()
    if (end - lastFrametime > 300) {
        lastFrametime = end
        document.getElementById("frametime").innerText = `${end - start} ms per frame`
    }
}
function reload() {
    const src = Array.from(source.value)
    try {
        f = run.apply(null, compile(str(src)))
    } catch(e) {
        error.innerText = fmtErr(e)
        return;
    }
    reset()
    document.getElementById("charcount").innerText = `${src.length} chars`
    location.hash = "c=" + btoa(String.fromCharCode(...new TextEncoder().encode(source.value)))
    handle = setInterval(update, 16)
}

if (location.hash.length > 1) {
    if (location.hash.startsWith("#c=")) {
        source.value = new TextDecoder().decode(
            new Uint8Array([...atob(location.hash.slice(3))].map(c=>c.charCodeAt(0))))
        reload()
    }
} else {
    source.value = "{136‿240⥊16|𝕨+↕16}"
}


// Rest of code copied/adapted from https://github.com/mlochbaum/BQN/blob/master/docs/repl.js

let kk=Array.from('`123456890-=~!@#$%^&*()_+qwertuiop[]QWERTIOP{}asdfghjkl;ASFGHKL:"zxcvbm,./ZXVBM<>? \'')
let kv=Array.from('˜˘¨⁼⌜´˝∞¯•÷×¬⎉⚇⍟◶⊘⎊⍎⍕⟨⟩√⋆⌽𝕨∊↑∧⊔⊏⊐π←→↙𝕎⍷𝕣⍋⊑⊒⍳⊣⊢⍉𝕤↕𝕗𝕘⊸∘○⟜⋄↖𝕊𝔽𝔾«⌾»·˙⥊𝕩↓∨⌊≡∾≍≠⋈𝕏⍒⌈≢≤≥⇐‿↩')
let keys={}
kk.map((k,i)=>{keys[k]=kv[i]})

let compose = false
source.onkeydown = (e) => {
    const k = e.key
    const w = e.which
    if (16 <= w && w <= 20)
        return
    else if (w == 13 && e.shiftKey) {
        reload()
        return false
    }
    else if (compose) {
        compose = false
        const c = keys[k]
        if (c) {
            const t = e.target
            let v = t.value
            let i = t.selectionStart
            t.value = v.slice(0,i)+c+v.slice(t.selectionEnd)
            t.selectionStart = t.selectionEnd = i+c.length
            return false
        }
    } else if (k === '\\') {
        compose = true
        return false
    }
}