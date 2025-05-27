// Filtrar en tiempo real solo 0 y 1 para ambos inputs
document.getElementById("mx").addEventListener("input", function () {
  this.value = this.value.replace(/[^01]/g, '');
});

document.getElementById("gx").addEventListener("input", function () {
  this.value = this.value.replace(/[^01]/g, '');
});

document.getElementById("crcForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const mx = document.getElementById("mx").value.trim();
  const gx = document.getElementById("gx").value.trim();
  const resultArea = document.getElementById("resultado");
  resultArea.innerHTML = "";

  if (mx.length < 16|| mx.length > 24) {
    resultArea.innerHTML = `<div class="paso">❌ Error: M(x) debe tener entre 16 y 24 bits en binario.</div>`;
    return;
  }

  if (gx.length < 4 || gx.length > 8) {
    resultArea.innerHTML = `<div class="paso">❌ Error: G(x) debe tener entre 4 y 8 bits en binario.</div>`;
    return;
  }

  // Validar que G(x) comience y termine con 1
  if (gx[0] !== '1' || gx[gx.length - 1] !== '1') {
    resultArea.innerHTML = `<div class="paso">❌ Error: El polinomio G(x) debe comenzar y terminar con 1 (ej: 10011).</div>`;
    return;
  }


  const polyMx = binToPoly(mx);
  resultArea.innerHTML += `<div class="paso"><strong>Paso 1 - M(x):</strong><br>${mx}<br>Forma polinómica: ${polyMx}</div>`;

  const polyGx = binToPoly(gx);
  const gradoGx = gx.length - 1;
  resultArea.innerHTML += `<div class="paso"><strong>Paso 2 - G(x):</strong><br>${gx}<br>Forma polinómica: ${polyGx}<br>Grado: ${gradoGx}</div>`;

  const mxExt = mx + "0".repeat(gradoGx);
  resultArea.innerHTML += `<div class="paso"><strong>Paso 3 - x^r * M(x):</strong><br>${mxExt}</div>`;

  const { residuo, pasosHtml } = DivisiónBinariaMódulo(mxExt, gx);
  resultArea.innerHTML += `<div class="paso"><strong>Paso 4 - División binaria módulo 2:</strong><br>${pasosHtml}`;

  const tx = mx + residuo;
  const padding = "&nbsp;".repeat(mx.length); // Espacios para alinear el residuo
  resultArea.innerHTML += `
    <div class="paso">
      <strong>Paso 5 - T(x):</strong><br>
      T(x) = M(x) * x^r - R(x)<br>
      = ${mxExt}<br>
      - ${padding}${residuo}<br>
       T(x):${tx}
    </div>`;
});

function binToPoly(binStr) {
  let poly = [];
  let len = binStr.length;
  for (let i = 0; i < len; i++) {
    if (binStr[i] === '1') {
      let degree = len - i - 1;
      if (degree > 1) poly.push(`x^${degree}`);
      else if (degree === 1) poly.push("x");
      else poly.push("1");
    }
  }
  return poly.join(" + ");
}

function DivisiónBinariaMódulo(dividend, divisor) {
  let dividendArr = dividend.split('').map(bit => parseInt(bit));
  const divisorArr = divisor.split('').map(bit => parseInt(bit));
  const len = divisorArr.length;
  let pasosHtml = '';

  pasosHtml += `<div class="division-header">
  <div class="division-title">División Binaria Módulo 2</div>
  <div class="division-labels">
    <div class="dividend-label">Dividendo inicial: ${dividend}</div>
    <div class="divisor-label">Divisor: ${divisor}</div>
  </div>
</div>`;


  pasosHtml += `<div class="division-steps">`;

  let cociente = "";
  let workingDividend = [...dividendArr];
  let stepCounter = 0;

  for (let i = 0; i <= workingDividend.length - len; i++) {
    if (workingDividend[i] === 1) {
      stepCounter++;
      cociente += "1";

      // Copia el estado antes del XOR
      const currentState = workingDividend.join('');

      // Realiza XOR y resalta los bits cambiados
      let xorResult = [];
      for (let j = 0; j < len; j++) {
        const original = workingDividend[i + j];
        workingDividend[i + j] ^= divisorArr[j];
        const changed = workingDividend[i + j];
        xorResult.push(changed === original ? changed : `<span class="changed-bit">${changed}</span>`);
      }

      pasosHtml += `
        <div class="division-step">
          <div class="step-header">Paso ${stepCounter}</div>
          <div class="step-content">
            <div><span class="label">Dividendo actual:</span> <span class="value">${currentState.slice(0, i + len)}</span></div>
            <div><span class="label">Divisor desplazado:</span> <span class="value">${' '.repeat(i)}${divisor}</span></div>
            <div><span class="label">Resultado XOR:</span> <span class="value">${xorResult.join('')}</span></div>
            <div><span class="label">Cociente parcial:</span> <span class="value">${cociente.padEnd(dividend.length, '0').slice(0, i+1)}</span></div>
          </div>
        </div>`;
    } else {
      cociente += "0";
    }
  }

  const residuo = workingDividend.slice(-len + 1).join('');

  pasosHtml += `</div><div class="division-summary">
    <div class="final-result">
      <span class="label">Cociente final:</span>
      <span class="value">${cociente}</span>
    </div>
    <div class="final-result">
      <span class="label">Residuo final (R(x)):</span>
      <span class="value">${residuo}</span>
    </div>
  </div>`;

  return { residuo, pasosHtml };
}


const mxInput = document.getElementById("mx");
const gxInput = document.getElementById("gx");

// Limitar solo 0 y 1 y máximo caracteres permitidos en tiempo real
mxInput.addEventListener("input", function () {
  // Reemplazar cualquier caracter que no sea 0 o 1
  this.value = this.value.replace(/[^01]/g, '');
  // Limitar a máximo 24 caracteres
  if (this.value.length > 24) {
    this.value = this.value.slice(0, 24);
  }
});

gxInput.addEventListener("input", function () {
  this.value = this.value.replace(/[^01]/g, '');
  if (this.value.length > 8) {
    this.value = this.value.slice(0, 8);
  }
});