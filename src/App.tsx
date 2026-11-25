import { Desktop } from './components/Desktop';
import { FileIcon } from './components/FileIcon';
import { Minesweeper, MinesweeperIcon } from './components/Minesweeper';
import { Snake, SnakeIcon } from './components/Snake';

function App() {
  return (
    <Desktop>
      <FileIcon name="Minesweeper.exe" icon={<MinesweeperIcon />}>
        <Minesweeper />
      </FileIcon>
      <FileIcon name="Snake.exe" icon={<SnakeIcon />}>
        <Snake />
      </FileIcon>
    </Desktop>
  );
}

export default App;
