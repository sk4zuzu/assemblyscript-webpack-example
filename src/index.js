import loader from "@assemblyscript/loader";
import fp from "lodash/fp";

const LOUDLY_CRYING_FACE_URL = "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/223/loudly-crying-face_1f62d.png";


const fp_composeAsync = (functions) => async (acc) => {
  for (let fn of functions.reverse()) {
    acc = (fn.constructor.name === "AsyncFunction")
        ? await fn(acc)
        : fn(acc);
  }
  return acc;
};


const fp_uint8ToString = fp.compose ([
  fp.join (""),
  fp.map ((subarray) => String.fromCharCode.apply(null, subarray)),
  fp.chunk (0x8000),
]);


const fp_uint8ToBase64String = fp.compose ([
  btoa,
  fp_uint8ToString,
]);


const fp_runRC4 = (wasm) => (key) => fp.compose ([
  (ref)                => new Uint8Array(ref),
  (ref)                => wasm.__getUint8Array(ref),
  ([keyRef, inputRef]) => wasm.RC4(keyRef, inputRef),
  (input)              => [wasm.__allocString(key), wasm.__allocArray(wasm.UINT8ARRAY, input)],
]);


const fp_decryptJPEG = (wasm) => (key) => fp_composeAsync ([
  (encoded)        => "data:image/jpeg;base64," + encoded,
  (decrypted)      => fp_uint8ToBase64String (decrypted),
  (encrypted)      => fp_runRC4 (wasm) (key) (encrypted),
  (ref)            => new Uint8Array(ref),
  async (response) => await response.arrayBuffer(),
  async (url)      => await fetch(url),
]);


const fp_renderJPEG = (wasm) => fp_composeAsync ([
  (src)              => document.getElementById("img").setAttribute("src", src),
  async ([url, key]) => (key.length > 0) ? await (fp_decryptJPEG (wasm) (key)) (url) : "",
  (url)              => [url, document.getElementById("key").value],
]);


const fp_handleEvents = (wasm) => (pics) => {
  let current = 0;
  document.addEventListener("keydown", async (event) => {
    switch (event.keyCode) {
      case 13: // Enter
        await fp_renderJPEG (wasm) (pics[current]);
        document.getElementById("key").blur();
        break;
      case 37: // Left
        current = (pics.length + (current - 1)) % pics.length;
        await fp_renderJPEG (wasm) (pics[current]);
        break;
      case 39: // Right
        current = (pics.length + (current + 1)) % pics.length;
        await fp_renderJPEG (wasm) (pics[current]);
        break;
    }
  });
  const $img = document.getElementById("img");
  $img.addEventListener("error", async () => {
    $img.setAttribute("src", LOUDLY_CRYING_FACE_URL);
  });
};


document.addEventListener("DOMContentLoaded", fp_composeAsync ([
  ([wasm, pics])   => fp_handleEvents (wasm) (pics),
  async (response) => [await loader.instantiateStreaming(response[0], {}), await response[1].json()],
  async ()         => [await fetch("optimized.wasm"), await fetch("list.json")],
]), false);


// vim:ts=2:sw=2:et:syn=javascript:
