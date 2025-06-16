// 引入路由模块
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const learningRouter = require('./routes/learning');
const communityRouter = require('./routes/community');
const learnRouter = require('./routes/learn');
const homeRouter = require('./routes/home');

// 注册API路由
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/learning', learningRouter);
app.use('/api/community', communityRouter);
app.use('/api/learn', learnRouter);
app.use('/api/home', homeRouter); 