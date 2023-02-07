let  board = null;
let  game = new Chess();
let  $status = $('#status');
// let  $fen = $('#fen');
// let  $pgn = $('#pgn');
let finalNodes = 0;
let latestEval = 0;
let speed = 0;
let analysysSpeed = 0;
let profundidade = 4;

const piecesObject = {
    p: {
        value: 100,
        modifier: [
            [50, 50, 50, 50, 50, 50, 50, 50],
            [0,  0,  0,  0,  0,  0,  0,  0],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [ 5,  5, 10, 25, 25, 10,  5,  5],
            [ 0,  0,  0, 20, 20,  0,  0,  0],
            [ 5, -5,-10,  0,  0,-10, -5,  5],
            [ 5, 10, 10,-20,-20, 10, 10,  5],
            [ 0,  0,  0,  0,  0,  0,  0,  0]
        ]
    },
    b: {
        value: 300,
        modifier: [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ]
    },
    n: {
        value: 300,
        modifier: [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ]
    },
    r:{
        value: 500,
        modifier: [
            [0,  0,  0,  0,  0,  0, 0, 0],
            [5, 10, 10, 10, 10, 10, 10, 5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [0,  0,  0,  5,  5,  0,  0,  0]
        ]
    },
    q: {
        value: 900,
        modifier: [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [-5,  0,  5,  5,  5,  5,  0, -5],
            [0,  0,  5,  5,  5,  5,  0, -5],
            [-5,  5,  5,  5,  5,  5,  0,-10],
            [-5,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ]
    },
    k: {
        value: 10000,
        modifier: [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [20, 20,  0,  0,  0,  0, 20, 20],
            [20, 30, 10,  0,  0, 25, 35, 25]
        ],
        endgameMod: [
            [-50,-40,-30,-20,-20,-30,-40,-50],
            [-30,-20,-10,  0,  0,-10,-20,-30],
            [-30,-10, 20, 30, 30, 20,-10,-30],
            [-30,-10, 30, 40, 40, 30,-10,-30],
            [-30,-10, 30, 40, 40, 30,-10,-30],
            [-30,-10, 20, 30, 30, 20,-10,-30],
            [-30,-30,  0,  0,  0,  0,-30,-30],
            [-50,-30,-30,-30,-30,-30,-30,-50]
        ]
    }
};


function drag (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false;
    
    // only pick up white pieces and only if it is whites turn
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (game.turn() === 'b')) {
        return false;
    }
}

function onDrop (source, target) {
    // see if the move is legal
    let  move = game.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for simplicity
    })
    
    // illegal move
    if (move === null) return 'snapback';
    
    updateStatus();
    // document.getElementById("chat").innerHTML = 'Thinking...';

    
    window.setTimeout(function(){computerMove(profundidade, -Infinity, Infinity, false)}, 250);
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function updateBoard () {
    board.position(game.fen());
}

function updateStatus () {
    let  status = '';
    document.getElementById("evaluation").innerHTML = latestEval;
    document.getElementById("jogadas").innerHTML = finalNodes;
    document.getElementById("speed").innerHTML = Math.round(speed);
    document.getElementById("analysysSpeed").innerHTML = Math.round(analysysSpeed*100000)/100000;
    document.getElementById("depth").innerHTML = profundidade;

    
    let  moveColor = 'brancas';
    if (game.turn() === 'b') {
        moveColor = 'pretas';
    }
    
    // checkmate?
    if (game.in_checkmate()) {
        status = 'Fim de Jogo, ' + moveColor + ' está em cheque-mate';
        alert('Fim de Jogo, ' + moveColor + ' está em cheque-mate');
    }
    
    // draw?
    else if (game.in_draw()) {
        status = 'Empate.';
        alert('Empate.')
    }
    
    // game still on
    else {
      status = 'Vez das peças ' + moveColor;
      
      // check?
      if (game.in_check()) {
          status += ', as peças ' + moveColor + ' estão em cheque';
        }
    }

    $status.html(status);

    // $fen.html(game.fen());
    // $pgn.html(game.pgn());
}

function onMoveEnd (){
    updateBoard();
}

let  config = {
    draggable: true,
    position: 'start',
    onDragStart: drag,
    onDrop: onDrop,
    onMoveEnd: onMoveEnd,
    onSnapEnd: updateBoard
}

board = Chessboard('board', config);

updateStatus();
$(window).on( "resize", board.resize );

function computerMove(depth, alpha, beta, maximazingPlayer){
    finalNodes = 0;

    // document.getElementById("chat").innerHTML = "Your turn!";

    let t0 = performance.now();

    let moves = game.generate_moves();
    let bestMove = moves[0];
    
    if (maximazingPlayer){
        let maxEval = -Infinity;
        for (let i = 0; i < moves.length; i++){
            let  move = moves[i];
            game.make_move(move);
            let  eval = minimax(depth - 1, alpha, beta, false);
            game.undo();
            if (eval > maxEval){
                maxEval = eval;
                bestMove = move;
            }
            beta = Math.min(beta, eval);
            if (alpha >= beta){
                break;
            }
        }
        latestEval = maxEval;
    }

    else {
        let  minEval = Infinity;
        for (let  i = 0; i < moves.length; i++){
            let  move = moves[i];
            game.make_move(move);
            let  eval = minimax(depth - 1, alpha, beta, true);
            game.undo();
            if (eval < minEval){
                minEval = eval;
                bestMove = move;
            }
            beta = Math.min(beta, eval);
            if (alpha >= beta){
                break;
            }
        }
        latestEval = minEval;
    }

    let t1 = performance.now();
    
    game.make_move(bestMove);

    speed = finalNodes / ((t1 - t0)/1000);
    analysysSpeed = ((t1 - t0)/1000) / finalNodes;
    console.log((t1 - t0)/1000);
    console.log(finalNodes);

    console.log("Speed: " + Math.round(speed*100)/100 + " positions per second");

    if (finalNodes < 3000)
        profundidade++;
    
    if (finalNodes > 15000)
        profundidade--;

    updateBoard();
    updateStatus();

    return bestMove;
}

function evaluatePosition(){
    finalNodes++;
    
    let  points = 0;

    //this seems repetitive, but the in_draw function only detects the 50 move rule and insufficient material
    // if (game.in_draw() || game.in_stalemate() || game.in_threefold_repetition()){
    //     return 0;
    // }

    //The threefold repetition reduces the speed of the evaluation function
    // if (game.in_draw() || game.in_stalemate()){
    //     return 0;
    // }

    //The threefold repetition and game.in_draw reduce the speed of the evaluation function
    if (game.in_draw()){
        return 0;
    }

    //Function to detect checkmate
    if (game.in_checkmate()){
        if (game.turn() === "w"){
            return -Infinity;
        }
        else{
            return +Infinity;
        }
    }

    for (let  i = 0, gameBoard = game.board(); i < 8; i++){
        for (let  j = 0; j < 8; j++){
            if (gameBoard[i][j] !== null){
                if (gameBoard[i][j].color === "b"){
                    points -= piecesObject[gameBoard[i][j].type].value + piecesObject[gameBoard[i][j].type].modifier[7-i][j];
                } else{
                    points += piecesObject[gameBoard[i][j].type].value + piecesObject[gameBoard[i][j].type].modifier[i][j];
                }
            }
        }
    }

    return points/100;
}

function minimax(depth, alpha, beta, maximazingPlayer){
    
    if (depth === 0){
        return evaluatePosition();
    }

    if (maximazingPlayer){
        let  maxEval = -Infinity;
        for (let  i = 0, moves = game.generate_moves(), len = moves.length; i < len; i++){
            let  move = game.make_move(moves[i]);
            let  eval = minimax(depth - 1, alpha, beta, false, move);
            game.undo();
            if (eval > maxEval){
                maxEval = eval;
            }
            alpha = Math.max(alpha, eval);
            if (alpha >= beta){
                break;
            }
        }
        return maxEval;
    }

    else {
        let  minEval = Infinity;
        for (let  i = 0, moves = game.generate_moves(), len = moves.length; i < len; i++){
            let  move = game.make_move(moves[i]);
            let  eval = minimax(depth - 1, alpha, beta, true, move);
            game.undo();
            if (eval < minEval){
                minEval = eval;
            }
            beta = Math.min(beta, eval);
            if (alpha >= beta){
                break;
            }
        }
        return minEval;
    }
}