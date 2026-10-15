const LARGURA = 360;
const ALTURA = 1120;
let cameraLigada = false;
let ocupado = false;
let fotos = [];          
let segundos = 3;

const id = Symbol('tira');
const tira = { legenda: '', [id]: 1 };   

//  moldura
const moldura = { cor: '#ffffff', texto: '#8c5b4a', borda: '#e8a0a0', vazio: '#f7e9e4' };

const dizer = (mensagem) => {
  const elemento = document.getElementById('status');
  if (elemento) {
    elemento.innerText = mensagem;
  }
};


function pedirLegenda() {
  let texto;
  do {
    texto = window.prompt('Legenda da tira (até 14 letras, vazio = sem legenda):', tira.legenda);
    if (texto !== null && texto.length > 14) {
      window.alert('Muito longa! Você usou ' + texto.length + ' letras.');
    }
  } while (texto !== null && texto.length > 14);
  if (texto !== null) {
    tira.legenda = texto;
    desenharTira();
  }
}


function desenharTira() {
  const c = document.getElementById('tira');
  const ctx = c.getContext('2d');


  ctx.fillStyle = moldura.cor;
  ctx.fillRect(0, 0, LARGURA, ALTURA);

  for (let i = 0; i < fotos.length; i++) {
    const y = 20 + i * 260;
    ctx.drawImage(fotos[i], 20, y);
    ctx.strokeStyle = moldura.borda;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, y, 320, 240);
  }


  let vazio = fotos.length;
  while (vazio < 4) {
    const y = 20 + vazio * 260;
    ctx.fillStyle = moldura.vazio;
    ctx.fillRect(20, y, 320, 240);
    ctx.strokeStyle = moldura.borda;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, y, 320, 240);
    ctx.fillStyle = moldura.texto;
    ctx.font = '48px serif';
    ctx.textAlign = 'center';
    ctx.fillText('˙𐃷˙', LARGURA / 2, y + 138);
    vazio++;
  }


  ctx.fillStyle = moldura.texto;
  ctx.textAlign = 'center';
  ctx.font = '30px Itim, sans-serif';
  ctx.fillText(tira.legenda.toUpperCase(), LARGURA / 2, ALTURA - 38);


  const link = document.getElementById('baixar');
  if (fotos.length === 4) {
    link.href = c.toDataURL('image/png');
    link.style.display = 'inline-block';
  } else {
    link.style.display = 'none';
  }
}

function ligarCamera() {
  const video = document.getElementById('video');
  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      cameraLigada = true;
      dizer('Câmera ligada. Clique em "Tirar 4 fotos".');
    })
    .catch((erro) => {
      window.alert('Não consegui acessar a câmera. Permita o acesso no navegador.\n\nDetalhe técnico: ' + erro.name + ' - ' + erro.message);
    });
}


function capturar() {
  const video = document.getElementById('video');
  const cv = document.getElementsByClassName('foto')[fotos.length];
  const g = cv.getContext('2d');
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  let sw = vw;
  let sh = vh;
  if (vw / vh > 4 / 3) {
    sw = vh * 4 / 3;
  } else {
    sh = vw * 3 / 4;
  }
  g.save();
  g.translate(320, 0);
  g.scale(-1, 1);
  g.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, 320, 240);
  g.restore();
  return cv;
}


function contagem(n, depois) {
  const aviso = document.getElementById('contagem');
  if (n <= 0) {
    aviso.style.display = 'none';
    depois();
    return;
  }
  aviso.style.display = 'flex';
  aviso.innerText = n;
  setTimeout(() => contagem(n - 1, depois), 1000);
}

function piscar() {
  const flash = document.getElementById('flash');
  flash.style.opacity = 1;
  setTimeout(() => { flash.style.opacity = 0; }, 120);
}


function tirarProxima() {
  if (fotos.length >= 4) {
    ocupado = false;
    tira[id]++;
    desenharTira();
    return;
  }
  contagem(segundos, () => {
    fotos.push(capturar());
    piscar();
    desenharTira();
    setTimeout(tirarProxima, 700);
  });
}

function tirarFoto() {
  if (!cameraLigada) {
    window.alert('Ligue a câmera primeiro!');
    return;
  }
  if (ocupado) {
    return;
  }
  const valor = Number(document.getElementById('segundos').value);
  if (valor >= 1 && valor <= 5 && valor % 1 === 0) {
    segundos = valor;
  } else {
    window.alert('Use um número inteiro de 1 a 5 segundos.');
    return;
  }
  if (fotos.length > 0 && !window.confirm('Refazer todas as fotos?')) {
    return;
  }
  fotos = [];
  ocupado = true;
  tirarProxima();
}

desenharTira();
document.fonts.load('30px Itim').then(desenharTira);   