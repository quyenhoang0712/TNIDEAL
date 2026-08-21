import app from './app.js';
import { PORT } from './config/env.js';

app.listen(PORT, () => {
  console.log(`API running at http://127.0.0.1:${PORT}`);
});
