import TextEditor from "./TextEditor";
import {
  BrowserRouter as Router,
  Routes, // ✅ Use 'Routes' instead of 'Switch'
  Route,
  Navigate, // ✅ Correct replacement for 'Redirect'
} from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect from "/" to a new document */}
        <Route
          path="/"
          element={<Navigate to={`/documents/${uuidv4()}`} replace />}
        />

        {/* Route for document editor */}
        <Route path="/documents/:id" element={<TextEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
