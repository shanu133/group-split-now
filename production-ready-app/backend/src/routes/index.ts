import { Router } from 'express';
import IndexController from '../controllers/index';

const router = Router();
const indexController = new IndexController();

export const setRoutes = () => {
    router.get('/', indexController.getHome);
    router.get('/api/data', indexController.getData);
    router.post('/api/data', indexController.postData);
    router.put('/api/data/:id', indexController.updateData);
    router.delete('/api/data/:id', indexController.deleteData);

    return router;
};