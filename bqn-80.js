// Assumes bqn.js has already been loaded
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
].map(v => [16, 8, 0].map(b => parseInt(v.slice(1), 16) >> b & 0xff))


function getCanvasCtx(div) {
  const canv = div.getElementsByClassName("canvas")[0] || (() => {
    let canv = document.createElement("canvas")
    canv.width = 240
    canv.height = 136
    canv.style = "display:block; width: 100%; image-rendering: pixelated; margin-bottom:4px;"
    canv.classList.add("canvas")
    div.prepend(canv)
    return canv
  })()

  return canv.getContext('2d')
}

function getErrorDiv(div) {
  return div.getElementsByClassName("error")[0] || (() => {
    let error = document.createElement("div")
    error.style = "color: brown"
    div.prepend(error)
    return error
  })()
}

function getButton(div, type, default_text) {
  return div.getElementsByClassName("button-" + type)[0] || (() => {
    let btn = document.createElement("button")
    btn.classList.add("button-" + type)
    btn.textContent = default_text
    div.prepend(btn)
    return btn
  })()
}

function getFrameTimeDiv(div) {
  return div.getElementsByClassName("frametime")[0] || (() => {
    let ftd = document.createElement("div")
    ftd.style = "float:right"
    div.prepend(ftd)
    return ftd
  })()
}

function getCharCountDiv(div) {
  return div.getElementsByClassName("charcount")[0] || (() => {
    let charcount = document.createElement("div")
    charcount.style = "float: right"
    return div.appendChild(charcount)
  })()
}

function setup(div) {
  const source = div.getElementsByClassName("source")[0]
  const error = getErrorDiv(div)

  const button_stop = getButton(div, "stop", "STOP!")
  const button_reload = getButton(div, "reload", "RUN!")

  const frameTimeDiv = getFrameTimeDiv(div)
  const charcount = getCharCountDiv(div)

  const ctx = getCanvasCtx(div)
  ctx.fillRect(0, 0, 240, 136)
  const img = ctx.getImageData(0, 0, 240, 136)

  let handle = null
  let t = 0
  let f
  let frame
  let lastFrametime = 0

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
  function update() {
    const start = Date.now()
    try {
      frame = f(frame, t++)
    } catch (e) {
      error.innerText = fmtErr(e)
      stop()
    }
    for (i = 0; i < Math.min(frame.length, 240 * 136); i++) {
      v = frame[i] & 0x0f
      c = palette[v]
      img.data[i * 4] = c[0]
      img.data[i * 4 + 1] = c[1]
      img.data[i * 4 + 2] = c[2]
      //img.data[i*4+3] = 255
    }
    ctx.putImageData(img, 0, 0)
    const end = Date.now()
    if (end - lastFrametime > 300) {
      lastFrametime = end
      frameTimeDiv.innerText = `${end - start} ms per frame`
    }
  }
  function reload() {
    const src = Array.from(source.value)
    try {
      f = run.apply(null, compile(str(src)))
    } catch (e) {
      error.innerText = fmtErr(e)
      return;
    }
    reset()
    charcount.innerText = `${src.length} chars`
    handle = setInterval(update, 16)
  }

  if (source.value == null) {
    source.value = source.innerText || "{136‿240⥊16|𝕨+↕16}"
  }

  // Set up document listeners
  button_reload.onclick = reload;
  button_stop.onclick = stop;


  // Rest of code* copied/adapted from https://github.com/mlochbaum/BQN/blob/master/docs/repl.js
  // * in this function

  let kk = Array.from('`123456890-=~!@#$%^&*()_+qwertuiop[]QWERTIOP{}asdfghjkl;ASFGHKL:"zxcvbm,./ZXVBM<>? \'')
  let kv = Array.from('˜˘¨⁼⌜´˝∞¯•÷×¬⎉⚇⍟◶⊘⎊⍎⍕⟨⟩√⋆⌽𝕨∊↑∧⊔⊏⊐π←→↙𝕎⍷𝕣⍋⊑⊒⍳⊣⊢⍉𝕤↕𝕗𝕘⊸∘○⟜⋄↖𝕊𝔽𝔾«⌾»·˙⥊𝕩↓∨⌊≡∾≍≠⋈𝕏⍒⌈≢≤≥⇐‿↩')
  let keys = {}
  kk.map((k, i) => { keys[k] = kv[i] })

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
        t.value = v.slice(0, i) + c + v.slice(t.selectionEnd)
        t.selectionStart = t.selectionEnd = i + c.length
        return false
      }
    } else if (k === '\\') {
      compose = true
      return false
    }
  }
}

for (let div of document.getElementsByClassName("bqn-80")) {
  setup(div);
}