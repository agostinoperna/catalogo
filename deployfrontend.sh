rsync -r src/ docs/
rsync build/contracts/catalgo.json docs/
git add .
git commit -m "adding frontend files to Github pages"
git push
