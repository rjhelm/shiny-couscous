import momngoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await momngoose.connect(`${process.env.MONGO_URI}`, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`.green.bold.underline.inverse);
    } catch (error) {
        console.log(`Error: ${error.message}`.red.underline.bold);
        process.exit(1);
    }
};

export default connectDB;