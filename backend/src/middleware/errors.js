export function notFound(_req, res) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(error, _req, res, _next) {
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Dữ liệu tải lên vượt quá giới hạn 10 MB' });
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({ message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: 'Username already exists' });
  }

  if (error.message?.includes('MONGODB_URI')) {
    return res.status(500).json({
      message: 'Server is missing MongoDB Atlas configuration'
    });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
}
