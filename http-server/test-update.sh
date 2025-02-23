curl \
  -v \
  -F "bookName=test" \
  -F "image=@test1.jpg" \
  -F "image=@test2.jpg" \
  localhost:3000/start-ocr
  # 45.32.28.15:3000/start-ocr
