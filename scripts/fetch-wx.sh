#!/usr/bin/env bash
#
# Cache live weather bundles for the tuning sweep. Ten cities chosen to span
# what the model has to cope with: deep dry desert convection, shallow humid
# air, marine layer, and permanent overcast.
#
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/.wx-cache"
mkdir -p "$DIR"
cat > "$DIR/cities.json" <<'EOF'
[["Los Angeles",34.052,-118.244],["Denver",39.739,-104.990],["Phoenix",33.448,-112.074],
 ["Seattle",47.606,-122.332],["Miami",25.775,-80.194],["Chicago",41.878,-87.630],
 ["London",51.507,-0.128],["Sydney",-33.869,151.209],["Albuquerque",35.084,-106.650],
 ["Minden NV",38.954,-119.766]]
EOF
node -e '
const fs=require("fs"),p=process.argv[1];
const cities=JSON.parse(fs.readFileSync(p+"/cities.json","utf8"));
(async()=>{for(const [n,lat,lon] of cities){
  const f=p+"/"+n.replace(/ /g,"_")+".json";
  const r=await fetch("https://branyontech.com/weather/api/bundle?lat="+lat+"&lon="+lon);
  fs.writeFileSync(f,JSON.stringify(await r.json()));
  console.log("  "+n);
}})();' "$DIR"
echo "cached in $DIR (gitignored)"
