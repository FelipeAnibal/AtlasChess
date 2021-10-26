let  board = null;
let  game = new Chess();
let  $status = $('#status');
let  $fen = $('#fen');
let  $pgn = $('#pgn');
let finalNodes = 0;
let latestEval = 0;

function drag (source, piece, position, orientation) {
    // do not pick up pieces if the game is over
    if (game.game_over()) return false;
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
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function updateBoard () {
    board.position(game.fen());
}

function updateStatus () {
    let  status = '';
    document.getElementById("evaluation").innerHTML = "Current Evaluation: " + latestEval;
    
    let  moveColor = 'White';
    if (game.turn() === 'b') {
        moveColor = 'Black';
    }
    
    // checkmate?
    if (game.in_checkmate()) {
        status = 'Game over, ' + moveColor + ' is in checkmate.';
        alert('Game over, ' + moveColor + ' is in checkmate.');
    }
    
    // draw?
    else if (game.in_draw()) {
        status = 'Game over, drawn position';
        alert('Game over, drawn position')
    }
    
    // game still on
    else {
      status = moveColor + ' to move';
      
      // check?
      if (game.in_check()) {
          status += ', ' + moveColor + ' is in check';
        }
    }

    $status.html(status);

    //$fen.html(game.fen());
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