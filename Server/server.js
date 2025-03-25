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
    try {
      const document = await findOrCreateDocument(documentID);
      socket.join(documentID);
      socket.emit("load-document", document.data);
    } catch (error) {
      console.error("Error loading document:", error);
      socket.emit("error", "Failed to load document");
    }
  });

  socket.on("send-changes", (delta, documentID) => {
    if (!documentID) return;
    socket.broadcast.to(documentID).emit("receive-changes", delta);
  });

  socket.on("save-document", async (data, documentID) => {
    if (!documentID) return;
    try {
      await Document.findByIdAndUpdate(documentID, { data }, { upsert: true });
    } catch (error) {
      console.error("Error saving document:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

async function findOrCreateDocument(id) {
  if (!id) return null;

  try {
    let document = await Document.findById(id);
    if (document) return document;

    return await Document.create({ _id: id, data: defaultValue });
  } catch (error) {
    console.error("Error in findOrCreateDocument:", error);
    throw error;
  }
}
