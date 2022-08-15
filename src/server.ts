import express from 'express';
import config from './app/config';
import authRouter from './app/auth/router';

const app = express();
const port = config.port || 3000;

app.use(express.json());

app.use('/api/v1', authRouter);

app.listen(port, () => console.log(`server is running on port ${port}`));
