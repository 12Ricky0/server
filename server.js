import 'dotenv/config'
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
const port = process.env.PORT || 3001

{
    origin: ['https://localhost:3001',
        'https://comment-app-mauve.vercel.app/']
}

const app = express();
app.use(cors({
    origin: ['https://localhost:3001',
        'https://comment-app-mauve.vercel.app/'],
    methods: ['GET', 'POST'],
    credentials: true
}
));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI);

const commentSchema = new mongoose.Schema({
    content: String

},
    {
        timestamps: {
            currentTime: () => new Date().toISOString().slice(0, 10)
        }
    });

const Comment = mongoose.model("Comment", commentSchema);


const articleSchema = new mongoose.Schema({
    name: { type: String },
    content: { type: String },
    score: { type: Number },
    time: { type: String },
    image: { type: String },
    comment: [commentSchema]
});

const Article = mongoose.model('Article', articleSchema);

app.get('/articles/:id', (req, res) => {
    Article.findOne({ _id: req.params.id })

        .then((foundArticle) => {

            res.send(foundArticle)
        })

        .catch((err) => {
            console.log(err)
        })
});


app.post('/articles/:id', (req, res) => {


    Article.findById({ _id: req.params.id })

        .then((foundArticle) => {
            foundArticle.comment.push(req.body);

            foundArticle.save()
            alert('Comment saved');
        })

        .catch((err) => {
            res.send(err)
        })
});


app.delete('/articles/:articleId/comment/:commentId', (req, res) => {

    Article.findOneAndUpdate(
        { _id: req.params.articleId },
        { $pull: { comment: { _id: req.params.commentId } } },
        { new: true },

    )
        .then((foundArticle) =>
            foundArticle.save()
        )
    res.send("Comment Deleted")


});

app.patch('/articles/:articleId/comment/:commentId', async (req, res) => {
    const { articleId, commentId } = req.params;
    const { content } = req.body;

    try {
        const article = await Article.findById(articleId);

        if (!article) {
            return res.status(404).json({ error: 'Article not found' });
        }

        const comment = article.comment.id(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        comment.content = content

        await article.save();

        res.status(200).json({ message: 'Subdocument updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.listen(port, () => {
    console.log(`Server started on port ${port}!...`);
})