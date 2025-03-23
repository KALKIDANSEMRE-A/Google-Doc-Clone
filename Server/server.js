const mongoose = require("mongoose");
const Document = require("./Document");

mongoose
  .connect("mongodb://localhost/google-docs-clone")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

const io = require("socket.io")(3002, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("get-document", async (documentID) => {
    const document = await findOrCreateDocument(documentID);
    socket.join(documentID);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentID).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentID, { data }, { upsert: true });
    });
  });
});

// ✅ Define the missing `findOrCreateDocument` function
async function findOrCreateDocument(id) {
  if (!id) return null;
  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
