document.addEventListener('DOMContentLoaded', () => {

    //CARROSSEL/////////////////////////////////////////////////////////////////////////////////////////////
    let count = 1;
    document.getElementById("radio1").checked = true; // Define o primeiro radio button como selecionado
    
    setInterval(function() {
      nextImage();
    }, 3000); // Chama a função nextImage a cada 3 segundos
  
    function nextImage() {
      count++;
      if (count > 5) { //se for maior que 5 o contador volta para o radio1 (primeira imagem)
        count = 1;
      }
      document.getElementById("radio" + count).checked = true; // Alterna a seleção dos radio buttons para avançar a imagem
    }
  

    //PAINEL DE COR///////////////////////////////////////////////////////////////////////////////////////////////
    const colorInput = document.querySelector('.colorPicker');
  
    colorInput.addEventListener('input', () => {
      const color = colorInput.value;
      const transparency = 0.5;
      const rgbaColor = hexToRGBA(color, transparency);
      context.strokeStyle = rgbaColor; // Define a cor do contorno a partir do valor selecionado no input de cor
    });

  
    function hexToRGBA(hex, transparency) {
      const r = parseInt(hex.substring(1, 3), 16); // ta em rgba, porque ao mesmo tempo da para
                                                   //ter uma cor e uma transparência
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${transparency})`; // Converte uma cor em formato hexadecimal para RGBA
    }
  

    //BORRACHA/////////////////////////////////////////////////////////////////////////////////////////////////////
    const eraserButton = document.querySelector('#toggleEraser');
    let isEraserActive = false;  //começa destivada
  
    eraserButton.addEventListener('click', () => {
      isEraserActive = !isEraserActive;
      eraserButton.classList.toggle('active', isEraserActive); // Adiciona ou remove a classe 'active' no botão de borracha, dependendo do estado da borracha
  
      if (isEraserActive) {
        context.strokeStyle = 'rgba(0, 0, 0, 0)'; // Define o contorno como transparente quando a borracha está ativa é essa transparência que faz apagar
        eraserButton.classList.add('green'); // Adiciona a classe 'green' ao botão
      } else {                                    
        const color = colorInput.value;
        const transparency = 0.5;
        const rgbaColor = hexToRGBA(color, transparency);
        context.strokeStyle = rgbaColor; // Define a cor do contorno a partir do valor selecionado no input de cor quando a borracha está desativada
        eraserButton.classList.remove('green') // Remove a classe 'green' do botão
        eraserButton.classList.add('red'); // Adiciona a classe red do botão
      }
    });

    //TAMANHO DA BORRACHA ////////////////////////////////////////////////////////////////////////////////////////////
    const eraserSizeInput = document.querySelector('#eraserSize');
  
    eraserSizeInput.addEventListener('change', () => {
      const eraserSize = parseInt(eraserSizeInput.value);
      context.lineWidth = eraserSize; // Define a largura da linha para o tamanho selecionado no input de tamanho da borracha
    });
  
    
    const eraseLine = (line) => {
    const eraserSize = parseInt(eraserSizeInput.value);
    context.clearRect(line.pos.x - eraserSize / 2, line.pos.y - eraserSize / 2, eraserSize, eraserSize);
    };

    const drawLine = (line) => {
    context.beginPath();
    context.moveTo(line.posAnterior.x, line.posAnterior.y);
    context.lineTo(line.pos.x, line.pos.y);
    context.stroke();
  };

  const cycle = () => {
    if (brush.active && brush.moving && brush.posAnterior) {
      if (isEraserActive) {
        eraseLine({
          pos: brush.pos,
          posAnterior: brush.posAnterior
        });
      } else {
        drawLine({
          pos: brush.pos,
          posAnterior: brush.posAnterior
        });
      }
      brush.moving = false;

      // Armazenar os dados do desenho na Web Storage
    /*const drawingData = {
        pos: brush.pos,
        posAnterior: brush.posAnterior,
        isEraserActive: isEraserActive
      };

      // Converter para string JSON
      /*const drawingDataJSON = JSON.stringify(drawingData);*/

      // Armazenar no sessionStorage
      /*sessionStorage.setItem('drawing', drawingDataJSON);*/
    }
    brush.posAnterior = {
      x: brush.pos.x,
      y: brush.pos.y
    };

    requestAnimationFrame(cycle);
  };

  //PINCEL//////////////////////////////////////////////////////////////////////////////////////////////////////////
  const brush = {
    active: false,
    moving: false,
    pos: {
      x: 0,
      y: 0
    },
    posAnterior: null
  };

  //TELA CANVA///////////////////////////////////////////////////////////////////////////////////////////////////////
  const screen = document.querySelector('#canvas');
  const context = screen.getContext('2d');

  // Função para substituir a imagem do canvas
  const replaceImage = (imageUrl) => {
    const image = new Image();
    image.onload = function() {
      // Redimensionar o canvas para o tamanho da imagem original
      screen.width = image.width;
      screen.height = image.height;

      // Desenhar a imagem no canvas
      context.drawImage(image, 0, 0);

      // Redimensionar o canvas para o tamanho desejado
      screen.style.width = '500px';
      screen.style.height = '500px';

      // Restaurar o estado do pincel após a troca de imagem
      const brushSize = parseInt(brushSizeInput.value);
      const color = colorInput.value;
      const transparency = 0.5;
      const rgbaColor = hexToRGBA(color, transparency);
      context.lineWidth = brushSize;
      context.strokeStyle = rgbaColor;
    };

    image.src = imageUrl;
  };

  // Adiciona um manipulador de evento para cada imagem no carrossel
  const carouselImages = document.querySelectorAll('.carousel-image'); //todas as imagens fazem parte dessa classe menos a inicial
  carouselImages.forEach((image, index) => {
    image.addEventListener('click', () => {
      const imageUrl = image.src;
      replaceImage(imageUrl);
    });
  });

  // Define a imagem inicial do canvas
  const initialImageUrl = './assets/bannergirl(500x500).png';
  replaceImage(initialImageUrl);

  //TAMANHo DO PINCEL ///////////////////////////////////////////////////////////////////////////////////////////////
  const brushSizeInput = document.querySelector('#brushSize');

  brushSizeInput.addEventListener('input', () => {
    const brushSize = parseInt(brushSizeInput.value);
    context.lineWidth = brushSize;
  });

  //ARRUMA AS COORDENADAS DO TRAÇO EM RELAÇÃO AO MOUSE
  const getMousePos = (event) => {
    const rect = screen.getBoundingClientRect();
    const scaleX = screen.width / rect.width;
    const scaleY = screen.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY
    };
  };

  // quando ao mouse estiver 'clicado' o pincel ativa 
  screen.addEventListener('mousedown', (event) => {
    brush.active = true;
    brush.moving = false;
    brush.posAnterior = getMousePos(event); // aqui chama a função que arruma as coordenadas do mouse
  });

  //quando o mouse não estiver 'clicado' o pincel desativa
  screen.addEventListener('mouseup', () => {
    brush.active = false;
    brush.moving = false;
  });

  // aqui ele pega o mmovimento do mouse
  screen.addEventListener('mousemove', (event) => {
    if (brush.active) {
      brush.pos = getMousePos(event); // chama a função que arruma as coordenadas do mouse
      brush.moving = true;
    }
  });

  cycle();
});
  


  
  
  