#!/bin/bash
node -e "require('bcrypt').hash('PASSWORD', 10).then(hash => console.log(\`hashed: \${hash}\`));"
