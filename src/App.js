
// index.js or App.js
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Calendar from './components/Calendar';

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <Calendar />
    </DndProvider>
  );
}

export default App;
