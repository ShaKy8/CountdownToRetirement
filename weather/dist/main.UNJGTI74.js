import{a as Je,b as ze,c as _e,d as Tt,e as gt,f as Qe,g as Xe,h as So,i as $o,j as Re,k as Et}from"./chunk.7JX7BFLW.js";var Un=new URL("./",location.href);async function Me(e,t){let o=new URL(e.replace(/^\//,""),Un);for(let[s,d]of Object.entries(t||{}))d!=null&&o.searchParams.set(s,d);let n=await fetch(o,{cache:"no-store"});if(!n.ok)throw new Error(`${e} -> ${n.status}`);return n.json()}var ce={config:()=>Me("/api/config"),bundle:(e,t)=>Me("/api/bundle",{lat:e,lon:t}),climate:(e,t)=>Me("/api/climate",{lat:e,lon:t}),models:(e,t)=>Me("/api/models",{lat:e,lon:t}),pollen:(e,t)=>Me("/api/pollen",{lat:e,lon:t}),observations:(e,t)=>Me("/api/observations",{lat:e,lon:t}),radar:()=>Me("/api/radar"),space:()=>Me("/api/space"),aurora:()=>Me("/api/aurora"),iss:()=>Me("/api/iss"),aircraft:(e,t,o)=>Me("/api/aircraft",{lat:e,lon:t,dist:o}),flight:(e,t)=>Me("/api/flight",{cs:e,hex:t}),elsewhere:e=>Me("/api/elsewhere",{q:e}),geocode:e=>Me("/api/geocode",{q:e}),reverse:(e,t)=>Me("/api/reverse",{lat:e,lon:t})};var Gn={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"},oe=e=>String(e??"").replace(/[<>&"']/g,t=>Gn[t]),N=(e,t,o)=>Math.min(o,Math.max(t,e)),At=(e,t,o)=>e+(t-e)*o;var Y={temp:e=>e==null?"--":`${Math.round(e)}\xB0`,tempP:e=>e==null?"--":`${e.toFixed(1)}\xB0`,pct:e=>e==null?"--":`${Math.round(e)}%`,wind:e=>e==null?"--":`${Math.round(e)}`,pressure:e=>e==null?"--":(e*.029529983071445).toFixed(2),inches:e=>e==null?"--":e<.01&&e>0?"<0.01":e.toFixed(2),miles:e=>e==null?"--":e>=1609*9?"10+":(e/1609.344).toFixed(1),int:e=>e==null?"--":String(Math.round(e)),signed:(e,t=1)=>e==null?"--":`${e>=0?"+":"\u2212"}${Math.abs(e).toFixed(t)}`},qn=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"],me=e=>e==null?"--":qn[Math.round((e%360+360)%360/22.5)%16];function rt(e){if(e==null)return"--";let t=Math.floor(e/3600),o=Math.round(e%3600/60);return t?`${t}h ${String(o).padStart(2,"0")}m`:`${o}m`}function to(e){let t=e-Date.now(),o=Math.abs(t),n=Math.round(o/6e4);if(n<1)return"now";let s=n<60?`${n} min`:`${Math.floor(n/60)}h ${String(n%60).padStart(2,"0")}m`;return t>0?`in ${s}`:`${s} ago`}var ko={0:["CLEAR","Clear sky","clear",0],1:["MAINLY CLEAR","Mainly clear","clear",0],2:["PARTLY CLOUDED","Partly cloudy","cloud",.4],3:["OVERCAST","Overcast","cloud",1],45:["FOG","Fog","fog",.7],48:["RIME FOG","Depositing rime fog","fog",1],51:["LIGHT DRIZZLE","Light drizzle","rain",.2],53:["DRIZZLE","Moderate drizzle","rain",.35],55:["DENSE DRIZZLE","Dense drizzle","rain",.5],56:["FREEZING DRIZZLE","Light freezing drizzle","rain",.3],57:["FREEZING DRIZZLE+","Dense freezing drizzle","rain",.5],61:["LIGHT RAIN","Slight rain","rain",.35],63:["RAIN","Moderate rain","rain",.6],65:["HEAVY RAIN","Heavy rain","rain",1],66:["FREEZING RAIN","Light freezing rain","rain",.5],67:["FREEZING RAIN+","Heavy freezing rain","rain",.9],71:["LIGHT SNOW","Slight snow fall","snow",.3],73:["SNOW","Moderate snow fall","snow",.6],75:["HEAVY SNOW","Heavy snow fall","snow",1],77:["SNOW GRAINS","Snow grains","snow",.3],80:["RAIN SHOWERS","Slight rain showers","rain",.45],81:["RAIN SHOWERS","Moderate rain showers","rain",.7],82:["VIOLENT SHOWERS","Violent rain showers","rain",1],85:["SNOW SHOWERS","Slight snow showers","snow",.5],86:["HEAVY SNOW SHOWERS","Heavy snow showers","snow",1],95:["THUNDERSTORM","Thunderstorm","storm",.7],96:["T-STORM + HAIL","Thunderstorm with slight hail","storm",.85],99:["SEVERE T-STORM","Thunderstorm with heavy hail","storm",1]};function et(e){let t=ko[e]||ko[0];return{code:e,label:t[0],long:t[1],kind:t[2],intensity:t[3]}}function oo(e,t=!0){let o=et(e).kind;return o==="clear"?e===0?t?"\u2600":"\u263E":t?"\u26C5":"\u2601":o==="cloud"?e===3?"\u2601":t?"\u26C5":"\u2601":o==="fog"?"\u2591":o==="rain"?"\u2614":o==="snow"?"\u2744":o==="storm"?"\u26A1":"\u25CB"}function Be(e){return e==null?{name:"NO DATA",color:"#8d9aab",level:0}:e<=50?{name:"GOOD",color:"#8fdc6a",level:1}:e<=100?{name:"MODERATE",color:"#ecd46a",level:2}:e<=150?{name:"SENSITIVE GROUPS",color:"#f59a5b",level:3}:e<=200?{name:"UNHEALTHY",color:"#f47171",level:4}:e<=300?{name:"VERY UNHEALTHY",color:"#c89af5",level:5}:{name:"HAZARDOUS",color:"#ef5a6a",level:6}}function Ve(e){return e==null?{name:"NO DATA",color:"#8d9aab"}:e<3?{name:"LOW",color:"#8fdc6a"}:e<6?{name:"MODERATE",color:"#ecd46a"}:e<8?{name:"HIGH",color:"#f59a5b"}:e<11?{name:"VERY HIGH",color:"#f47171"}:{name:"EXTREME",color:"#c89af5"}}var To=[null,200,250,300,450,600,1e3];function Lt(e,t=3){if(!e||e<=.1)return null;let o=To[t]??To[3];return Math.round(o/(e*1.5))}function vt(e){return e==null?{name:"NO DATA",color:"#8d9aab"}:e<2.5?{name:"LOW",color:"#8fdc6a"}:e<4.9?{name:"LOW-MED",color:"#c6dc6e"}:e<7.3?{name:"MEDIUM",color:"#ecd46a"}:e<9.7?{name:"MED-HIGH",color:"#f59a5b"}:{name:"HIGH",color:"#f47171"}}function Ct(e){return e==null?{name:"NO DATA",color:"#8d9aab",lat:null}:e<3?{name:"QUIET",color:"#6bb3bd",lat:66}:e<4?{name:"UNSETTLED",color:"#3fd0d8",lat:63}:e<5?{name:"ACTIVE",color:"#8fdc6a",lat:60}:e<6?{name:"G1 STORM",color:"#ecd46a",lat:56}:e<7?{name:"G2 STORM",color:"#f59a5b",lat:53}:e<8?{name:"G3 STORM",color:"#f47171",lat:50}:e<9?{name:"G4 STORM",color:"#c89af5",lat:47}:{name:"G5 EXTREME",color:"#ef5a6a",lat:42}}function Dt(e){return e==null?{name:"--",effect:""}:e<1?{name:"CALM",effect:"smoke rises vertically"}:e<4?{name:"LIGHT AIR",effect:"smoke drifts"}:e<8?{name:"LIGHT BREEZE",effect:"leaves rustle"}:e<13?{name:"GENTLE BREEZE",effect:"flags extend"}:e<19?{name:"MODERATE",effect:"dust and paper lift"}:e<25?{name:"FRESH BREEZE",effect:"small trees sway"}:e<32?{name:"STRONG BREEZE",effect:"umbrellas fail"}:e<39?{name:"NEAR GALE",effect:"walking is work"}:e<47?{name:"GALE",effect:"twigs break off"}:e<55?{name:"STRONG GALE",effect:"shingles lift"}:e<64?{name:"STORM",effect:"trees uprooted"}:e<73?{name:"VIOLENT STORM",effect:"widespread damage"}:{name:"HURRICANE",effect:"devastation"}}function je(e){return e==null?{name:"--",color:"#8d9aab",note:""}:e<30?{name:"VERY DRY",color:"#7fb2f0",note:"static, chapped lips"}:e<45?{name:"DRY",color:"#3fd0d8",note:"crisp and comfortable"}:e<55?{name:"COMFORTABLE",color:"#8fdc6a",note:"ideal"}:e<60?{name:"STICKY",color:"#c6dc6e",note:"noticeable humidity"}:e<65?{name:"HUMID",color:"#ecd46a",note:"uncomfortable"}:e<70?{name:"OPPRESSIVE",color:"#f59a5b",note:"sweat does not evaporate"}:e<75?{name:"MISERABLE",color:"#f47171",note:"dangerous for exertion"}:{name:"LETHAL",color:"#ef5a6a",note:"limit outdoor exposure"}}function yt(e="",t=""){let o=e.toLowerCase();return/tornado|hurricane|extreme|tsunami/.test(o)?"#ef5a6a":/warning/.test(o)?"#f47171":/watch/.test(o)?"#f59a5b":/advisory|statement/.test(o)?"#ecd46a":t==="Extreme"||t==="Severe"?"#f47171":"#3fd0d8"}function It(e){let t=f=>new Intl.DateTimeFormat("en-US",{timeZone:e,...f}),o=t({hour:"2-digit",minute:"2-digit",hour12:!1}),n=t({hour:"numeric",minute:"2-digit",hour12:!0}),s=t({hour:"numeric",hour12:!0}),d=t({weekday:"short"}),v=t({month:"short",day:"numeric"}),g=t({weekday:"long",month:"long",day:"numeric"}),y=t({hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),w=f=>{if(f==null)return null;let l=new Date(f);return Number.isNaN(+l)?null:l},i=f=>l=>{let h=w(l);return h?f.format(h):"--"},c=new Intl.DateTimeFormat("en-CA",{timeZone:e}),M=new Intl.DateTimeFormat("en-US",{timeZone:e,hour:"numeric",minute:"numeric",hour12:!1});return{hm:i(o),hm12:i(n),hour:i(s),weekday:i(d),monthDay:i(v),full:i(g),hms:i(y),isoDate:f=>{let l=w(f);return l?c.format(l):"--"},hourOfDay:f=>{let l=w(f);if(!l)return NaN;let h=M.formatToParts(l),a=u=>+h.find(m=>m.type===u)?.value;return a("hour")%24+a("minute")/60}}}function Eo(e,t){let o=new Date(e);if(Number.isNaN(+o))return NaN;let n=new Intl.DateTimeFormat("en-CA",{timeZone:t}).format(o),[,s,d]=n.split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][s-1]+d-1}var Ao="atmos.v1";function ao(e,t){if(!e||typeof e!="object")return null;let o=e.latitude??e.lat,n=e.longitude??e.lon,s=d=>(typeof d=="number"||typeof d=="string"&&d.trim()!=="")&&Number.isFinite(+d);return!s(o)||!s(n)||Math.abs(+o)>90||Math.abs(+n)>180?null:{name:e.name,admin1:e.admin1||"",country:e.country_code||e.country||"",lat:+o,lon:+n,tz:e.timezone||e.tz||t,elevation:e.elevation??null}}function Lo(e){let t=ao(e);return t&&{name:t.name,admin1:t.admin1,country_code:t.country,latitude:t.lat,longitude:t.lon,timezone:t.tz}}var so=e=>typeof e=="string"&&e?`${e.includes("T")?e:`${e}T00:00:00`}Z`:"",Oo=e=>t=>Date.parse(so(t))-e*1e3;function Pt(e,t,o){if(!e?.time?.length)return[];let n=Oo(t),s=e.time.length,d=new Array(s);for(let v=0;v<s;v++){let g={t:n(e.time[v]),i:v};for(let[y,w]of Object.entries(o))g[y]=e[w]?.[v]??null;d[v]=g}return d}var Co={temp:"temperature_2m",rh:"relative_humidity_2m",dew:"dew_point_2m",feels:"apparent_temperature",pop:"precipitation_probability",precip:"precipitation",rain:"rain",showers:"showers",snow:"snowfall",snowDepth:"snow_depth",code:"weather_code",pressure:"pressure_msl",surfPressure:"surface_pressure",cloud:"cloud_cover",cloudLow:"cloud_cover_low",cloudMid:"cloud_cover_mid",cloudHigh:"cloud_cover_high",vis:"visibility",vpd:"vapour_pressure_deficit",wind:"wind_speed_10m",windDir:"wind_direction_10m",gust:"wind_gusts_10m",uv:"uv_index",uvClear:"uv_index_clear_sky",isDay:"is_day",sunshine:"sunshine_duration",cape:"cape",li:"lifted_index",cin:"convective_inhibition",freezing:"freezing_level_height",blh:"boundary_layer_height",wetbulb:"wet_bulb_temperature_2m",soilT:"soil_temperature_0cm",soilM:"soil_moisture_0_to_1cm",et0:"et0_fao_evapotranspiration"},Vn={code:"weather_code",tmax:"temperature_2m_max",tmin:"temperature_2m_min",feelsMax:"apparent_temperature_max",feelsMin:"apparent_temperature_min",sunriseS:"sunrise",sunsetS:"sunset",daylight:"daylight_duration",sunshine:"sunshine_duration",uvMax:"uv_index_max",precip:"precipitation_sum",rain:"rain_sum",showers:"showers_sum",snow:"snowfall_sum",precipHours:"precipitation_hours",pop:"precipitation_probability_max",windMax:"wind_speed_10m_max",gustMax:"wind_gusts_10m_max",windDir:"wind_direction_10m_dominant",radiation:"shortwave_radiation_sum",et0:"et0_fao_evapotranspiration"},Do={precip:"precipitation",code:"weather_code",cape:"cape",vis:"visibility",gust:"wind_gusts_10m",isDay:"is_day"},Io={aqi:"us_aqi",pm10:"pm10",pm25:"pm2_5",co:"carbon_monoxide",no2:"nitrogen_dioxide",so2:"sulphur_dioxide",o3:"ozone",aod:"aerosol_optical_depth",dust:"dust",uv:"uv_index",alder:"alder_pollen",birch:"birch_pollen",grass:"grass_pollen",mugwort:"mugwort_pollen",olive:"olive_pollen",ragweed:"ragweed_pollen"},jn=.3048;function Po(e,t,o){if(!t||!e?.length)return;let n=Object.entries(o).filter(([,s])=>t[s]==="ft").map(([s])=>s);if(n.length)for(let s of e)for(let d of n)s[d]!=null&&(s[d]*=jn)}var Kn=new Set(["code","isDay","i"]);function Yn(e,t,o){if(!e)return t?{...t}:null;if(!t)return{...e};let n={};for(let s in e){let d=e[s],v=t[s];if(Kn.has(s)){n[s]=o<.5?d:v;continue}typeof d=="number"&&typeof v=="number"?n[s]=s==="windDir"?((d+(((v-d)%360+540)%360-180)*o)%360+360)%360:At(d,v,o):n[s]=d??v}return n}function no(e,t){if(!e?.length)return null;if(t<=e[0].t)return{...e[0]};if(t>=e.at(-1).t)return{...e.at(-1)};let o=e[1].t-e[0].t,n=(t-e[0].t)/o,s=N(Math.floor(n),0,e.length-2);return Yn(e[s],e[s+1],n-s)}var io=class{constructor(){this.listeners=new Map,this.requestId=0,this.pendingLocation=null,this.pendingRemember=!0,this.loc=null,this.tz=Intl.DateTimeFormat().resolvedOptions().timeZone,this.fmt=It(this.tz),this.raw=null,this.hours=[],this.days=[],this.min15=[],this.air=[],this.airNow=null,this.alerts=[],this.space=null,this.climate=null,this.models=null,this.pollen=null,this.radar=null,this.observed=null,this.cursor=Date.now(),this.now=Date.now(),this.following=!0,this.playing=!1,this.playRate=1,this.view="deck",this.status="boot",this.lastFetch=0,this.favorites=[],this.settings={sound:!1,skinType:3,voice:!0},this.restore()}on(t,o){return this.listeners.has(t)||this.listeners.set(t,new Set),this.listeners.get(t).add(o),()=>this.listeners.get(t).delete(o)}emit(t,o){for(let n of this.listeners.get(t)||[])try{n(o)}catch(s){console.error(`[store:${t}]`,s)}}restore(){try{let t=JSON.parse(localStorage.getItem(Ao)||"{}");t.loc&&(this.loc=ao(t.loc,this.tz)),Array.isArray(t.favorites)&&(this.favorites=t.favorites.map(Lo).filter(Boolean)),t.settings&&Object.assign(this.settings,t.settings)}catch{}}save(){try{localStorage.setItem(Ao,JSON.stringify({loc:this.loc,favorites:this.favorites,settings:this.settings}))}catch{}}setStatus(t){this.status=t,this.emit("status",t)}async setLocation(t,{remember:o=!0}={}){let n=ao(t,this.tz);n&&(this.pendingLocation=n,this.pendingRemember=o,await this.refresh({full:!0}))}addFavorite(t){let o=s=>`${(+(s.lat??s.latitude)).toFixed(3)},${(+(s.lon??s.longitude)).toFixed(3)}`,n=Lo(t);n&&(this.favorites=this.favorites.filter(s=>o(s)!==o(n)),this.favorites.unshift(n),this.favorites=this.favorites.slice(0,12),this.save(),this.emit("favorites",this.favorites))}removeFavorite(t){this.favorites.splice(t,1),this.save(),this.emit("favorites",this.favorites)}async refresh({full:t=!1}={}){let o=this.pendingLocation||this.loc;if(!o)return;let{lat:n,lon:s}=o,d=this.pendingLocation,v=this.pendingRemember,g=++this.requestId,y=()=>g===this.requestId;t=t||!!d,this.setStatus("load");try{let i=await ce.bundle(n,s);if(!y())return;if(!i.forecast?.ok||!Array.isArray(i.forecast.data?.hourly?.time)||!i.forecast.data.hourly.time.length)throw new Error(`Forecast unavailable for ${o.name||"this location"}`);let c=i.forecast.data.timezone||o.tz,M=It(c),f={loc:{...o,tz:c},tz:c,fmt:M,following:this.following,cursor:this.cursor};this.ingest.call(f,i),(!this.loc||this.loc.lat!==n||this.loc.lon!==s)&&(this.climate=this.models=this.pollen=this.observed=this.radar=null),Object.assign(this,f),this.pendingLocation=null,d&&v&&this.save(),this.lastFetch=Date.now(),this.setStatus("ok"),d&&this.emit("loc",this.loc),this.emit("data",this)}catch(i){if(!y())return;console.error("[store] bundle failed",i),this.setStatus("err"),this.emit("error",i);return}let w=[ce.radar().then(i=>{y()&&(this.radar=i,this.emit("radar",i))}),ce.pollen(n,s).then(i=>{y()&&(this.pollen=i,this.emit("pollen",i))}),ce.observations(n,s).then(i=>{y()&&(this.observed=i,this.emit("observed",i))})];(t||!this.climate)&&w.push(ce.climate(n,s).then(i=>{y()&&(this.climate=i,this.emit("climate",i))})),(t||!this.models)&&w.push(ce.models(n,s).then(i=>{y()&&(this.models=this.reduceModels(i),this.emit("models",this.models))})),Promise.allSettled(w).then(()=>{y()&&this.emit("data",this)})}ingest(t){this.raw=t;let o=t.forecast?.ok?t.forecast.data:null;if(o){let s=o.utc_offset_seconds??0;this.utcOffset=s,this.elevation=o.elevation,o.timezone&&o.timezone!==this.tz&&(this.tz=o.timezone,this.fmt=It(this.tz),this.loc&&(this.loc.tz=o.timezone)),this.hours=Pt(o.hourly,s,Co),this.min15=Pt(o.minutely_15,s,Do),Po(this.hours,o.hourly_units,Co),Po(this.min15,o.minutely_15_units,Do),this.days=Pt(o.daily,s,Vn).map(d=>({...d,sunrise:d.sunriseS?Date.parse(so(d.sunriseS))-s*1e3:null,sunset:d.sunsetS?Date.parse(so(d.sunsetS))-s*1e3:null}))}let n=t.air?.ok?t.air.data:null;if(this.air=[],this.airNow=null,n&&(this.air=Pt(n.hourly,n.utc_offset_seconds??0,Io),this.airNow=n.current?Object.fromEntries(Object.entries(Io).map(([s,d])=>[s,n.current[d]??null])):null),this.alerts=t.alerts?.ok&&Array.isArray(t.alerts.data?.features)?t.alerts.data.features.filter(s=>s&&typeof s=="object").map(s=>({...s.properties,geometry:s.geometry})):[],this.space=t.space?.ok?t.space.data:null,this.hours.length){let s=this.following?Date.now():this.cursor;this.cursor=N(s,this.hours[0].t,this.hours.at(-1).t)}}reduceModels(t){let o=t?.hourly;if(!o?.time?.length)return null;let n=t.utc_offset_seconds??0,s=Oo(n),d=Object.keys(o).filter(g=>g.startsWith("temperature_2m_")).map(g=>g.replace("temperature_2m_","")),v=[];for(let g=0;g<o.time.length;g++){let y=d.map(c=>o[`temperature_2m_${c}`]?.[g]).filter(c=>c!=null),w=d.map(c=>o[`precipitation_${c}`]?.[g]).filter(c=>c!=null);if(!y.length)continue;let i=y.reduce((c,M)=>c+M,0)/y.length;v.push({t:s(o.time[g]),mean:i,min:Math.min(...y),max:Math.max(...y),spread:Math.max(...y)-Math.min(...y),temps:y,precipAgree:w.length?w.filter(c=>c>.004).length/w.length:null})}return{names:d,rows:v}}setCursor(t,{silent:o=!1}={}){if(!this.hours.length)return;let n=this.hours[0].t,s=this.hours.at(-1).t;this.cursor=N(t,n,s),o||this.emit("cursor",this.cursor)}scrubTo(t,o){this.following=!1,this.setCursor(t,o)}syncToNow(){if(!this.following||this.playing||this.view==="radar")return;let t=Date.now();Math.abs(t-this.cursor)<1e3||this.setCursor(t)}toNow(){this.playing=!1,this.following=!0,this.setCursor(Date.now()),this.emit("play",!1)}get atNow(){return Math.abs(this.cursor-Date.now())<9e4}get span(){return this.hours.length?{lo:this.hours[0].t,hi:this.hours.at(-1).t}:{lo:0,hi:0}}frame(t=this.cursor){let o=no(this.hours,t);if(!o)return null;let n={...o,t},s=no(this.min15,t);s&&Math.abs(s.t-t)<30*6e4&&s.precip!=null&&(n.precip=s.precip,n.code=s.code??n.code,s.cape!=null&&(n.cape=s.cape),s.vis!=null&&(n.vis=s.vis),s.gust!=null&&(n.gust=s.gust));let d=no(this.air,t);d&&(n.air=d),n.wx=et(Math.round(n.code??0)),n.day=this.dayFor(t);let{lat:v,lon:g}=this.loc||{lat:0,lon:0},y=new Date(t),w=Je(y,v,g),i=Qe(y,v,g),c=Xe(y);return n.sun={alt:w.altitude,az:w.azimuth,altDeg:w.altitude*57.29578,compass:ze(w.azimuth)},n.moon={alt:i.altitude,az:i.azimuth,altDeg:i.altitude*57.29578,compass:ze(i.azimuth),phase:c.phase,fraction:c.fraction,distance:i.distance},n}dayFor(t){let o=this.fmt.isoDate(t);return this.days.find(n=>this.fmt.isoDate(n.t)===o)||null}sunTimesFor(t=this.cursor){let{lat:o,lon:n}=this.loc||{lat:0,lon:0};return Tt(new Date(t),o,n,this.elevation||0)}moonTimesFor(t=this.cursor){let{lat:o,lon:n}=this.loc||{lat:0,lon:0};return $o(new Date(t),o,n)}skyParams(t=this.cursor){let o=this.frame(t);if(!o)return null;let n=o.wx.kind,s=o.precip??0,d=N(s/.12,0,1),v=n==="rain"||n==="snow"||n==="storm"?N(Math.max(o.wx.intensity*.55,d),0,1):d*.6,g=this.currentKp()??2;return{sunAlt:o.sun.alt,sunAz:o.sun.az+Math.PI,moonAlt:o.moon.alt,moonAz:o.moon.az+Math.PI,moonPhase:o.moon.phase,moonFrac:o.moon.fraction,viewAz:this.viewBearing(o),cloudLow:N((o.cloudLow??0)/100,0,1),cloudMid:N((o.cloudMid??0)/100,0,1),cloudHigh:N((o.cloudHigh??0)/100,0,1),precip:v,snow:n==="snow"?1:0,storm:n==="storm"?.85:N((o.cape??0)/2500,0,.6),fog:n==="fog"?.85:N(1-(o.vis??2e4)/6e3,0,.6),wind:o.wind??5,windDir:((o.windDir??0)+180)*Math.PI/180,kp:g,lat:this.loc?.lat??0,haze:N(1-(o.vis??24e3)/24e3,0,.8),cityGlow:.55}}viewBearing(t){let o=(this.loc?.lat??0)>=0?Math.PI:0;return t.sun.altDeg>-8?t.sun.az+Math.PI:t.moon.altDeg>2?t.moon.az+Math.PI:o}currentKp(){let t=this.space?.kpNow;if(t?.ok&&Array.isArray(t.data)&&t.data.length){let o=t.data.at(-1),n=Number(o.estimated_kp??o.kp_index);if(Number.isFinite(n))return n}return null}kpForecast(){let t=this.space?.kpFc;if(!t?.ok||!Array.isArray(t.data)||!t.data.length)return[];let o=t.data;return(Array.isArray(o[0])?o.slice(1).map(s=>({time_tag:s[0],kp:s[1],observed:s[2]})):o).map(s=>({t:Date.parse(String(s.time_tag).replace(" ","T").replace(/Z?$/,"Z")),kp:Number(s.kp??s.kp_index??s.estimated_kp),observed:s.observed})).filter(s=>Number.isFinite(s.kp)&&Number.isFinite(s.t))}},r=new io;var lo=new Set,ae={tier:2,fps:60,onBattery:!1,batteryLevel:1,hidden:!1,reducedMotion:matchMedia("(prefers-reduced-motion: reduce)").matches,manual:null,onChange(e){return lo.add(e),()=>lo.delete(e)}},ro=0,Ot=0,Ro=0,ct=0,ut=0;function No(e){ro++,Ot+=e;let t=performance.now();if(t-Ro<1e3)return;Ro=t,ae.fps=Ot>0?ro/Ot:60,ro=0,Ot=0,ae.fps<40?(ct++,ut=0):ae.fps>55?(ut++,ct=0):(ct=0,ut=0);let o=lt();o!==ae.tier&&dt(o)}function xn(){return typeof matchMedia!="function"?!1:matchMedia("(pointer: coarse)").matches&&matchMedia("(max-width: 820px)").matches}function lt(){if(ae.manual!=null)return ae.manual;if(ae.hidden)return 0;if(ae.reducedMotion)return 1;if(xn()){let t=1;return ct>=3&&(t=Math.max(0,ae.tier-1)),ut>=6&&ae.tier<2&&(t=ae.tier+1),Math.max(0,Math.min(2,t))}let e=ae.onBattery?2:3;return ae.onBattery&&ae.batteryLevel<.25&&(e=1),ct>=3&&(e=Math.max(0,ae.tier-1)),ut>=6&&e>ae.tier&&(e=ae.tier+1),Math.max(0,Math.min(3,e))}function dt(e){ae.tier=e,document.documentElement.dataset.q=String(e),ct=0,ut=0;for(let t of lo)t(e)}function Ho(){document.addEventListener("visibilitychange",()=>{ae.hidden=document.hidden,dt(lt())}),matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{ae.reducedMotion=e.matches,dt(lt())}),navigator.getBattery&&navigator.getBattery().then(e=>{let t=()=>{ae.onBattery=!e.charging,ae.batteryLevel=e.level,dt(lt())};e.addEventListener("chargingchange",t),e.addEventListener("levelchange",t),t()}).catch(()=>{}),dt(lt())}function co(e){ae.manual=e,dt(lt())}var Zn=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,Jn=`#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2  uRes;
uniform float uTime;
uniform int   uQuality;      // 0..3, drives octave counts and effect gating

uniform float uSunAlt;       // radians
uniform float uSunAz;        // radians, 0 = north, increasing eastward
uniform float uMoonAlt;
uniform float uMoonAz;
uniform float uMoonPhase;    // 0 new .. 0.5 full .. 1 new
uniform float uMoonFrac;     // illuminated fraction

uniform float uViewAz;       // bearing the camera faces
uniform float uCloudLow;
uniform float uCloudMid;
uniform float uCloudHigh;
uniform float uPrecip;       // 0..1 intensity
uniform float uSnow;         // 0 = rain, 1 = snow
uniform float uStorm;        // 0..1 convective activity
uniform float uFlash;        // lightning, driven from JS
uniform float uFog;          // 0..1
uniform float uWind;         // mph
uniform float uWindDir;      // radians, direction wind blows TOWARD
uniform float uKp;           // 0..9 planetary K index
uniform float uLat;          // observer latitude, degrees
uniform float uHaze;         // aerosol / low visibility
uniform float uCityGlow;     // light-pollution intensity on the horizon

#define PI 3.14159265359
#define TAU 6.28318530718

/* ------------------------------------------------------------ noise */

float hash21(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}

vec2 hash22(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p, int oct) {
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8); // decorrelate octaves
  for (int i = 0; i < 7; i++) {
    if (i >= oct) break;
    v += a * vnoise(p);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return v;
}

/* Ridged noise reads more like real cloud structure than plain fbm. */
float ridged(vec2 p, int oct) {
  float v = 0.0, a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 6; i++) {
    if (i >= oct) break;
    v += a * (1.0 - abs(vnoise(p) * 2.0 - 1.0));
    p = rot * p * 2.1;
    a *= 0.5;
  }
  return v;
}

/*
 * Skyline height in radians of elevation, for a given azimuth. Four octaves
 * of hashed blocks give a mix of towers and low-rise without any geometry.
 */
float skyline(float az) {
  float h = 0.0;
  for (int i = 0; i < 4; i++) {
    float scale = 16.0 + float(i) * 25.0;
    float cell = floor(az * scale);
    float r = hash21(vec2(cell, float(i) * 31.7));
    float bh = r * r * (0.085 - float(i) * 0.016);
    h = max(h, bh * step(0.28, r));
  }
  return h;
}

/* Great-circle angle between two (azimuth, elevation) pairs. */
float angDist(float az1, float el1, float az2, float el2) {
  float c = sin(el1) * sin(el2) + cos(el1) * cos(el2) * cos(az1 - az2);
  return acos(clamp(c, -1.0, 1.0));
}

/*
 * Project a viewing ray onto a horizontal slab at height h and return the
 * ground-plane coordinate. This is what makes cloud decks converge toward
 * the horizon instead of sliding like a flat texture.
 */
vec2 slab(float az, float el, float h) {
  float s = max(sin(el), 0.012);
  float t = h / s;
  return vec2(sin(az), cos(az)) * t;
}

/* ------------------------------------------------------------ main */

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;

  // Horizon sits low so the sky dominates the frame.
  float horizonY = -0.30;
  float elev = (uv.y - horizonY) * 0.95;              // ~ +/- radians
  float el   = elev * (PI * 0.42);
  float az   = uViewAz + uv.x * aspect * 0.95;

  int oct = uQuality >= 3 ? 6 : uQuality == 2 ? 5 : uQuality == 1 ? 4 : 3;

  // Needed by both the cloud masks and the ground block below.
  float cityH = skyline(az);

  /*
   * Optical depth of the cloud column. Thick cloud does not merely cover the
   * sky, it blocks the light coming through it, so this dims the palette AND
   * occludes the sun and moon. Without it a 95%-overcast thunderstorm renders
   * as a bright white sheet with a visible solar halo burnt through it.
   */
  float totalCloud = clamp(uCloudLow * 0.62 + uCloudMid * 0.30 + uCloudHigh * 0.08, 0.0, 1.0);
  float gloom = clamp(1.0 - totalCloud * 0.68 - uStorm * 0.34, 0.12, 1.0);
  float seeThrough = 1.0 - totalCloud * 0.92;   // how much of the disc survives

  float sunDeg = uSunAlt * 57.29578;
  float dayAmt   = smoothstep(-6.5, 7.0, sunDeg);
  float nightAmt = 1.0 - smoothstep(-15.0, -1.5, sunDeg);
  float goldAmt  = exp(-pow((sunDeg - 1.5) / 8.0, 2.0));

  /* ---------------------------------------------------- sky gradient */

  float zen = clamp(el / (PI * 0.5), 0.0, 1.0);

  // Palettes are graded toward cyan and magenta rather than natural blue.
  vec3 dayZen  = vec3(0.031, 0.243, 0.478);
  vec3 dayHor  = vec3(0.298, 0.667, 0.808);
  vec3 goldZen = vec3(0.075, 0.153, 0.400);
  vec3 goldHor = vec3(1.000, 0.412, 0.180);
  vec3 nightZen= vec3(0.004, 0.010, 0.035);
  vec3 nightHor= vec3(0.020, 0.055, 0.125);

  vec3 zenC = mix(nightZen, dayZen, dayAmt);
  vec3 horC = mix(nightHor, dayHor, dayAmt);
  zenC = mix(zenC, goldZen, goldAmt * 0.75);
  horC = mix(horC, goldHor, goldAmt * 0.85);

  float grad = pow(1.0 - zen, 2.1);
  vec3 col = mix(zenC, horC, grad);

  // A magenta bloom opposite the sun: the anti-twilight arch, and at night
  // the light dome of a city. Orange County has plenty of both.
  float horizonBand = pow(1.0 - clamp(abs(el) / 0.30, 0.0, 1.0), 2.5);
  float sunSideward = 0.5 + 0.5 * cos(az - uSunAz);
  col += vec3(1.0, 0.18, 0.55) * horizonBand * goldAmt * 0.35 * (1.0 - sunSideward);
  col += vec3(1.0, 0.45, 0.16) * horizonBand * goldAmt * 0.55 * sunSideward;
  col += vec3(1.0, 0.30, 0.62) * horizonBand * nightAmt * uCityGlow * 0.55;
  col += vec3(0.20, 0.85, 1.00) * horizonBand * nightAmt * uCityGlow * 0.22;

  /* ---------------------------------------------------------- stars */

  if (nightAmt > 0.01 && el > cityH) {
    // Cell-based star field in angular space, so stars stay put as the
    // horizon curves rather than stretching.
    vec2 sp = vec2(az * 30.0, el * 30.0);
    vec2 cell = floor(sp);
    vec2 f = fract(sp);
    float starTot = 0.0;
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec2 o = vec2(float(i), float(j));
        vec2 h = hash22(cell + o);
        if (h.x > 0.55) {                 // star density
          vec2 pos = o + h;
          float d = length(f - pos);
          float mag = hash21(cell + o + 7.1);
          float bright = pow(mag, 3.4) * 2.2 + 0.035;   // few bright, many faint
          // Twinkle harder near the horizon, where the air path is longest.
          float tw = 0.75 + 0.25 * sin(uTime * (1.5 + mag * 5.0) + mag * 30.0)
                     * (1.0 - smoothstep(0.0, 0.6, el));
          starTot += bright * tw * smoothstep(0.075, 0.0, d);
        }
      }
    }
    // Milky Way: a broad band tilted by observer latitude.
    float mwBand = exp(-pow((el - 0.55 + sin(az * 0.8) * 0.28) / 0.30, 2.0));
    float mwTex = fbm(vec2(az * 3.0, el * 3.0) + 11.0, oct);
    vec3 mwCol = mix(vec3(0.35, 0.45, 0.75), vec3(0.75, 0.55, 0.85), mwTex);
    float horizonFade = smoothstep(cityH, cityH + 0.25, el);

    col += vec3(0.85, 0.93, 1.0) * starTot * nightAmt * horizonFade * seeThrough;
    col += mwCol * mwBand * mwTex * 0.16 * nightAmt * horizonFade * seeThrough;
  }

  /* --------------------------------------------------------- aurora */

  if (uKp >= 3.0 && nightAmt > 0.2) {
    // Aurora sits toward the pole: north above the equator, south below.
    float poleAz = uLat >= 0.0 ? 0.0 : PI;
    float toPole = abs(mod(az - poleAz + PI, TAU) - PI);
    float facing = smoothstep(1.5, 0.2, toPole);
    float band = smoothstep(0.02, 0.10, el) * (1.0 - smoothstep(0.22, 0.75, el));
    float curtain = ridged(vec2(az * 2.4 + uTime * 0.045, el * 5.0 - uTime * 0.10), oct);
    float rays = fbm(vec2(az * 22.0, el * 2.0 - uTime * 0.35), 3);
    float strength = smoothstep(3.0, 7.5, uKp) * facing * band;
    vec3 auroraCol = mix(vec3(0.15, 1.0, 0.55), vec3(0.70, 0.25, 1.0), smoothstep(0.3, 0.85, curtain));
    col += auroraCol * pow(curtain, 2.2) * rays * strength * 1.5;
  }

  /* ------------------------------------------------------- sun/moon */

  float sunD = angDist(az, el, uSunAz, uSunAlt);
  float moonD = angDist(az, el, uMoonAz, uMoonAlt);

  // Broad forward-scattering halo, present even when the disc is below us.
  float halo = exp(-sunD * 2.6) * 0.55 + exp(-sunD * 9.0) * 0.6;
  vec3 sunTint = mix(vec3(1.0, 0.42, 0.14), vec3(1.0, 0.95, 0.80), dayAmt);
  col += sunTint * halo * (0.35 + dayAmt * 0.9) * smoothstep(-0.22, 0.02, uSunAlt)
         * mix(0.10, 1.0, seeThrough);

  // The disc itself, ~0.53 deg across, with a touch of bloom.
  float sunDisc = smoothstep(0.0105, 0.0075, sunD);
  if (uSunAlt > -0.06) {
    col = mix(col, vec3(1.0, 0.97, 0.88), sunDisc * 0.97 * seeThrough);
    col += sunTint * exp(-sunD * 60.0) * 1.2 * seeThrough;
  }

  // Moon: a lit disc with a real terminator, plus earthshine on the dark limb.
  if (uMoonAlt > -0.05) {
    float md = smoothstep(0.0125, 0.0095, moonD);
    if (md > 0.001) {
      // Local disc coordinates, so we can carve the phase.
      float dAz = mod(az - uMoonAz + PI, TAU) - PI;
      float dx = dAz * cos(uMoonAlt);
      float dy = el - uMoonAlt;
      float r = 0.0115;
      vec2 p = vec2(dx, dy) / r;
      /*
       * Terminator. The shadow edge is an ellipse whose semi-minor axis is
       * k = 1 - 2f, running +1 at new moon through 0 at quarter to -1 at
       * full. A waxing moon is lit on the right, a waning moon on the left.
       */
      float k = 1.0 - 2.0 * uMoonFrac;
      float term = k * sqrt(max(0.0, 1.0 - p.y * p.y));
      float sd = (uMoonPhase < 0.5) ? (p.x - term) : (-p.x - term);
      float lit = smoothstep(-0.09, 0.09, sd);
      float mare = fbm(p * 1.6 + 3.0, 3);
      vec3 moonSurf = mix(vec3(0.86, 0.90, 0.96), vec3(0.55, 0.60, 0.70), mare * 0.55);
      vec3 moonLit = moonSurf * (0.15 + 0.95 * lit) + vec3(0.06, 0.10, 0.16) * (1.0 - lit);
      float moonVis = (1.0 - dayAmt * 0.55) * seeThrough;
      col = mix(col, moonLit, md * moonVis);
      col += vec3(0.65, 0.80, 1.0) * exp(-moonD * 90.0) * uMoonFrac * moonVis * 0.5;
    }
  }

  /* --------------------------------------------------------- clouds */

  float windRad = uWindDir;
  vec2 drift = vec2(sin(windRad), cos(windRad)) * uTime * (0.004 + uWind * 0.0016);
  float skyMask = smoothstep(cityH - 0.004, cityH + 0.03, el);

  vec3 cloudLitDay   = vec3(1.00, 0.99, 0.98);
  vec3 cloudLitGold  = vec3(1.00, 0.52, 0.30);
  vec3 cloudShadeDay = vec3(0.36, 0.44, 0.56);
  vec3 cloudNight    = vec3(0.045, 0.075, 0.135);

  vec3 cLit   = mix(cloudNight * 2.2, mix(cloudLitDay, cloudLitGold, goldAmt * 0.8), dayAmt) * gloom;
  vec3 cShade = mix(cloudNight, cloudShadeDay, dayAmt) * gloom;

  // Storm cloud is bruised blue-grey, not neutral.
  vec3 stormTint = vec3(0.34, 0.37, 0.50);
  cLit   = mix(cLit,   cLit   * stormTint, uStorm * 0.65);
  cShade = mix(cShade, cShade * stormTint, uStorm * 0.75);

  // The sky between the clouds dims too.
  col *= mix(1.0, gloom, 0.75);
  // Under a city dome, cloud bases pick up magenta from below.
  cShade += vec3(0.55, 0.12, 0.30) * nightAmt * uCityGlow * 0.35;

  // -- high deck: thin cirrus, fast, wispy
  if (uCloudHigh > 0.01) {
    vec2 p = slab(az, el, 7.0) * 0.11 + drift * 2.2;
    float n = ridged(p, oct);
    float cov = smoothstep(1.02 - uCloudHigh * 0.75, 1.25 - uCloudHigh * 0.75, n + uCloudHigh * 0.35);
    cov *= skyMask * smoothstep(0.0, 0.16, el);
    col = mix(col, mix(cShade, cLit, 0.85), cov * 0.55 * uCloudHigh);
  }

  // -- mid deck
  if (uCloudMid > 0.01) {
    vec2 p = slab(az, el, 3.2) * 0.22 + drift * 1.4;
    float n = fbm(p, oct);
    float cov = smoothstep(0.62 - uCloudMid * 0.34, 0.80 - uCloudMid * 0.30, n);
    cov *= skyMask * smoothstep(0.0, 0.10, el);
    float shade = fbm(p + vec2(0.35), oct - 1);
    col = mix(col, mix(cShade, cLit, smoothstep(0.30, 0.72, shade)), cov * 0.72 * uCloudMid);
  }

  // -- low deck: the one you actually feel, thickest and slowest
  if (uCloudLow > 0.01) {
    vec2 p = slab(az, el, 1.35) * 0.40 + drift;
    float n = fbm(p, oct);
    float det = fbm(p * 3.1 - drift * 0.4, oct - 1);
    n = n * 0.78 + det * 0.22;
    float cov = smoothstep(0.58 - uCloudLow * 0.36, 0.76 - uCloudLow * 0.30, n);
    cov *= skyMask * smoothstep(0.0, 0.055, el);
    // Fake self-shadowing: sample slightly toward the sun for the lit side.
    float toward = fbm(p + vec2(sin(uSunAz), cos(uSunAz)) * 0.16, oct - 1);
    float shade = smoothstep(0.34, 0.70, toward);
    vec3 body = mix(cShade, cLit, shade);
    col = mix(col, body, cov * 0.92 * uCloudLow);

    // Lightning lights the deck from inside.
    if (uFlash > 0.001) {
      col += vec3(0.80, 0.88, 1.0) * cov * uFlash * 0.85;
    }
  }

  /* ------------------------------------------------------------ fog */

  if (uFog > 0.01) {
    float fogAmt = uFog * (1.0 - smoothstep(-0.05, 0.35, el));
    vec3 fogCol = mix(vec3(0.06, 0.10, 0.16), vec3(0.62, 0.70, 0.78), dayAmt);
    fogCol += vec3(0.45, 0.10, 0.28) * nightAmt * uCityGlow * 0.5;
    float swirl = fbm(vec2(az * 3.0, el * 6.0) + uTime * 0.02, 4);
    col = mix(col, fogCol, clamp(fogAmt * (0.6 + swirl * 0.5), 0.0, 0.95));
  }

  // General aerosol haze washes out contrast near the horizon.
  col = mix(col, mix(vec3(0.10, 0.13, 0.18), vec3(0.68, 0.72, 0.76), dayAmt),
            uHaze * horizonBand * 0.45);

  /* ------------------------------------------------- ground / city */

  /*
   * The skyline occupies POSITIVE elevation \u2014 buildings stand up from the
   * horizon. Ground (grid floor) is everything below el = 0.
   */
  if (el < cityH) {
    vec3 ground;

    if (el >= 0.0) {
      // --- building face ---
      float up = el / max(cityH, 1e-4);              // 0 at street, 1 at roofline
      vec3 face = vec3(0.012, 0.017, 0.034) * (1.0 - up * 0.45);

      // Window grid. Columns follow azimuth, rows follow elevation.
      vec2 wcell = floor(vec2(az * 520.0, el * 900.0));
      float lit = hash21(wcell);
      float on = step(0.80 - nightAmt * 0.10, lit);
      vec3 winCol = mix(vec3(1.0, 0.76, 0.32), vec3(0.35, 0.95, 1.0), hash21(wcell + 5.7));
      face += winCol * on * (0.45 + nightAmt * 1.05);

      // Occasional neon sign band on a facade.
      float signHash = hash21(vec2(floor(az * 45.0), 3.0));
      if (signHash > 0.88) {
        float band = smoothstep(0.42, 0.46, up) * (1.0 - smoothstep(0.56, 0.60, up));
        vec3 signCol = mix(vec3(1.0, 0.10, 0.55), vec3(0.10, 1.0, 0.85), hash21(vec2(floor(az * 45.0), 9.0)));
        face += signCol * band * (0.6 + nightAmt * 1.4)
                * (0.7 + 0.3 * sin(uTime * 3.0 + signHash * 40.0));
      }

      // Roofline aviation lights.
      float roof = smoothstep(0.965, 1.0, up) * step(0.93, hash21(vec2(floor(az * 90.0), 17.0)));
      face += vec3(1.0, 0.12, 0.12) * roof * (0.5 + 0.5 * sin(uTime * 2.2));

      ground = face;
    } else {
      /*
       * Ground plane grid. Project the ray onto a floor one unit below the
       * eye: distance along the ground is 1/tan(dip), so the grid genuinely
       * converges at the horizon instead of fanning out from screen centre.
       */
      float dip = -el;
      float dist = 1.0 / max(tan(dip), 0.004);
      vec2 fp = vec2(sin(az), cos(az)) * dist;
      fp.y -= uTime * 0.55;                       // drift toward the viewer

      // Derivative-aware line width keeps distant lines from aliasing away.
      vec2 gw = fwidth(fp) * 1.4;
      vec2 gf = abs(fract(fp) - 0.5);
      vec2 gl = smoothstep(gw, vec2(0.0), gf);
      float grid = clamp(max(gl.x, gl.y), 0.0, 1.0);

      float fade = 1.0 / (1.0 + dist * dist * 0.0022);
      vec3 gridCol = mix(vec3(0.55, 0.10, 0.42), vec3(0.0, 0.92, 1.0), clamp(dist / 14.0, 0.0, 1.0));
      ground = vec3(0.004, 0.008, 0.020) + gridCol * grid * fade * 0.42;
      // Wet streets mirror the sky when it is raining.
      ground += horC * uPrecip * 0.16 * fade;   // wet streets mirror the sky
    }

    // Haze stacked on the skyline, and the city's own light dome.
    float distFade = exp(-max(0.0, cityH - el) * 22.0);
    // Skyline haze is lit by the sky above it, so it must dim with the sky.
    ground += mix(horC, vec3(1.0, 0.22, 0.52), nightAmt * 0.65)
              * distFade * (0.22 + uCityGlow * 0.45) * mix(gloom, 1.0, nightAmt * 0.7);

    col = mix(col, ground, smoothstep(cityH + 0.0015, cityH - 0.0015, el));
  }

  // Glow spilling upward off the skyline into the sky.
  {
    float above = el - cityH;
    if (above > 0.0) {
      col += mix(vec3(0.9, 0.45, 0.15), vec3(1.0, 0.25, 0.60), nightAmt)
             * exp(-above * 55.0) * uCityGlow * (0.10 + nightAmt * 0.30)
             * mix(gloom, 1.0, nightAmt * 0.7);
    }
  }

  /* --------------------------------------------------- precipitation */

  if (uPrecip > 0.01 && uQuality >= 1) {
    vec2 sp = vec2(uv.x * aspect, uv.y);
    float acc = 0.0;
    int layers = uQuality >= 3 ? 4 : uQuality == 2 ? 3 : 2;

    if (uSnow < 0.5) {
      // Rain: near-vertical streaks, sheared by wind, faster in the near layers.
      float shear = clamp(uWind / 45.0, 0.0, 0.6) * sign(sin(uWindDir - uViewAz));
      for (int i = 0; i < 4; i++) {
        if (i >= layers) break;
        float fi = float(i);
        float scale = 34.0 + fi * 26.0;
        float speed = 2.6 + fi * 1.9;
        vec2 q = vec2(sp.x * scale + fi * 17.0, sp.y * scale * 0.24 + uTime * speed);
        q.x += q.y * shear;
        vec2 cell = floor(q);
        float h = hash21(cell);
        if (h > 0.972 - uPrecip * 0.045) {
          vec2 f = fract(q) - vec2(hash21(cell + 1.7), 0.5);
          float streak = smoothstep(0.055, 0.0, abs(f.x)) * smoothstep(0.62, 0.0, abs(f.y));
          acc += streak * (0.5 + fi * 0.22);
        }
      }
      // Streaks veil the scene; they must never overwhelm it.
      acc = clamp(acc, 0.0, 1.0);
      col = mix(col, col * 0.82 + vec3(0.30, 0.44, 0.58), acc * uPrecip * 0.42);
    } else {
      // Snow: slow drifting flakes with a lateral sway.
      for (int i = 0; i < 4; i++) {
        if (i >= layers) break;
        float fi = float(i);
        float scale = 18.0 + fi * 15.0;
        float speed = 0.30 + fi * 0.26;
        vec2 q = vec2(sp.x * scale, sp.y * scale + uTime * speed);
        vec2 cell = floor(q);
        float h = hash21(cell);
        if (h > 0.962 - uPrecip * 0.045) {
          vec2 f = fract(q) - 0.5;
          f.x += sin(uTime * (0.7 + h) + h * 20.0) * 0.28;
          float flake = smoothstep(0.14 + fi * 0.02, 0.0, length(f));
          acc += flake * (0.55 + fi * 0.2);
        }
      }
      acc = clamp(acc, 0.0, 1.0);
      col = mix(col, col * 0.85 + vec3(0.62, 0.68, 0.78), acc * uPrecip * 0.55);
    }
  }

  // Precipitation greys out distance; this is most of what "heavy rain" looks like.
  if (uPrecip > 0.01) {
    vec3 veil = mix(vec3(0.06, 0.09, 0.14), vec3(0.42, 0.47, 0.54), dayAmt) * gloom;
    col = mix(col, veil, clamp(uPrecip * 0.45, 0.0, 0.55) * horizonBand);
  }

  // Full-frame lightning wash.
  col += vec3(0.75, 0.85, 1.0) * uFlash * 0.16;

  /* ------------------------------------------------------- grading */

  // Gentle filmic curve, then a cyan-shadow / magenta-highlight push.
  col = max(col, 0.0);
  col = (col * (2.51 * col + 0.03)) / (col * (2.43 * col + 0.59) + 0.14);
  col = mix(col, col * vec3(0.88, 1.02, 1.10), 0.35);            // cool the shadows
  col += vec3(0.030, 0.0, 0.022) * pow(max(col.r, 0.0), 2.0);    // magenta in the highs

  // Vignette (the CSS layer adds another, subtler one on top).
  float vig = 1.0 - 0.28 * pow(length(uv * vec2(aspect, 1.0)) * 0.62, 2.2);
  col *= vig;

  fragColor = vec4(col, 1.0);
}`,Fo={sunAlt:.4,sunAz:3,moonAlt:-.4,moonAz:1,moonPhase:.25,moonFrac:.5,viewAz:Math.PI,cloudLow:.2,cloudMid:.1,cloudHigh:.1,precip:0,snow:0,storm:0,fog:0,wind:6,windDir:4,kp:2,lat:33.6,haze:.15,cityGlow:.5},Qn=new Set(["snow","lat"]),Rt=class{constructor(t){this.canvas=t,this.gl=null,this.params={...Fo},this.target={...Fo},this.quality=2,this.running=!1,this.flash=0,this.nextBolt=1/0,this.scale=1,this.ok=!1,this.t0=performance.now()}init(){let t=this.canvas.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1});if(!t)return this.ok=!1,!1;this.gl=t;let o=Xn(t,Zn,Jn);if(!o)return this.ok=!1,!1;this.prog=o,t.useProgram(o);let n=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,n),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let s=t.getAttribLocation(o,"aPos");t.enableVertexAttribArray(s),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0),this.u={};for(let d of["uRes","uTime","uQuality","uSunAlt","uSunAz","uMoonAlt","uMoonAz","uMoonPhase","uMoonFrac","uViewAz","uCloudLow","uCloudMid","uCloudHigh","uPrecip","uSnow","uStorm","uFlash","uFog","uWind","uWindDir","uKp","uLat","uHaze","uCityGlow"])this.u[d]=t.getUniformLocation(o,d);return this.resize(),this.ok=!0,!0}set(t){Object.assign(this.target,t)}snap(t){Object.assign(this.target,t),Object.assign(this.params,t)}setQuality(t){this.quality=t,this.scale=t>=3?1:t===2?.85:t===1?.65:.5,this.resize()}resize(){let t=this.gl;if(!t)return;let o=Math.min(window.devicePixelRatio||1,this.quality>=3?2:1.5),n=Math.max(2,Math.floor(this.canvas.clientWidth*o*this.scale)),s=Math.max(2,Math.floor(this.canvas.clientHeight*o*this.scale));this.canvas.width===n&&this.canvas.height===s||(this.canvas.width=n,this.canvas.height=s,t.viewport(0,0,n,s))}render(t,o){if(!this.ok)return;let n=this.gl,s=this.params,d=this.target,v=1-Math.pow(.0016,o);for(let y in d){if(Qn.has(y)){s[y]=d[y];continue}if(y.endsWith("Az")||y==="windDir"){let w=d[y]-s[y];w=((w+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,s[y]+=w*v}else s[y]+=(d[y]-s[y])*v}s.storm>.12?(this.nextBolt===1/0&&(this.nextBolt=t+Math.random()*3e3),t>this.nextBolt&&(this.flash=.3+Math.random()*.45,this.nextBolt=t+900+Math.random()*9e3*(1.15-s.storm))):this.nextBolt=1/0,this.flash*=Math.pow(8e-5,o),this.flash<.002&&(this.flash=0);let g=this.u;n.uniform2f(g.uRes,this.canvas.width,this.canvas.height),n.uniform1f(g.uTime,(t-this.t0)/1e3),n.uniform1i(g.uQuality,this.quality),n.uniform1f(g.uSunAlt,s.sunAlt),n.uniform1f(g.uSunAz,s.sunAz),n.uniform1f(g.uMoonAlt,s.moonAlt),n.uniform1f(g.uMoonAz,s.moonAz),n.uniform1f(g.uMoonPhase,s.moonPhase),n.uniform1f(g.uMoonFrac,s.moonFrac),n.uniform1f(g.uViewAz,s.viewAz),n.uniform1f(g.uCloudLow,s.cloudLow),n.uniform1f(g.uCloudMid,s.cloudMid),n.uniform1f(g.uCloudHigh,s.cloudHigh),n.uniform1f(g.uPrecip,s.precip),n.uniform1f(g.uSnow,s.snow),n.uniform1f(g.uStorm,s.storm),n.uniform1f(g.uFlash,this.flash),n.uniform1f(g.uFog,s.fog),n.uniform1f(g.uWind,s.wind),n.uniform1f(g.uWindDir,s.windDir),n.uniform1f(g.uKp,s.kp),n.uniform1f(g.uLat,s.lat),n.uniform1f(g.uHaze,s.haze),n.uniform1f(g.uCityGlow,s.cityGlow),n.drawArrays(n.TRIANGLES,0,3)}};function Xn(e,t,o){let n=zo(e,e.VERTEX_SHADER,t),s=zo(e,e.FRAGMENT_SHADER,o);if(!n||!s)return null;let d=e.createProgram();return e.attachShader(d,n),e.attachShader(d,s),e.linkProgram(d),e.getProgramParameter(d,e.LINK_STATUS)?(e.deleteShader(n),e.deleteShader(s),d):(console.error("[sky] link failed:",e.getProgramInfoLog(d)),null)}function zo(e,t,o){let n=e.createShader(t);if(e.shaderSource(n,o),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){let s=e.getShaderInfoLog(n);console.error(`[sky] ${t===e.VERTEX_SHADER?"vertex":"fragment"} compile failed:
${s}`);let d=/ERROR:\s*\d+:(\d+)/.exec(s||"");if(d){let v=o.split(`
`),g=+d[1];console.error(v.slice(Math.max(0,g-3),g+2).map((y,w)=>`${Math.max(1,g-2)+w}| ${y}`).join(`
`))}return null}return n}var j=["#3fd0d8","#f07aa6","#f2b45a","#b39dfa","#7fb2f0"],R={good:"#8fdc6a",warn:"#ecd46a",serious:"#f59a5b",crit:"#f47171"},ye="#dde2e8",pe="#b3bfcc",se="#8d9aab",uo="rgba(255,255,255,.055)",ea="#0f1826",Bo="#16212f",ta="500 12px 'JetBrains Mono', ui-monospace, monospace",ke="500 11.5px 'JetBrains Mono', ui-monospace, monospace",we="600 11.5px 'Chakra Petch', system-ui, sans-serif";function Ae(e){if(e==null)return pe;let t=[[-20,"#9d8ef5"],[10,"#6aa9f0"],[32,"#3fd0d8"],[50,"#5cd6bc"],[65,"#a2d86a"],[78,"#ecd46a"],[88,"#f59a5b"],[100,"#f47171"],[115,"#f07aa6"]];if(e<=t[0][0])return t[0][1];if(e>=t.at(-1)[0])return t.at(-1)[1];for(let o=0;o<t.length-1;o++){let[n,s]=t[o],[d,v]=t[o+1];if(e>=n&&e<=d)return We(s,v,(e-n)/(d-n))}return pe}function We(e,t,o){let n=[1,3,5].map(v=>parseInt(e.slice(v,v+2),16)),s=[1,3,5].map(v=>parseInt(t.slice(v,v+2),16));return`#${n.map((v,g)=>Math.round(At(v,s[g],N(o,0,1)))).map(v=>v.toString(16).padStart(2,"0")).join("")}`}function V(e,t){let o=[1,3,5].map(n=>parseInt(e.slice(n,n+2),16));return`rgba(${o[0]},${o[1]},${o[2]},${t})`}var tt=new Set;function Wo(){for(let e of tt)e.hover=null,e.render();tt.clear()}var _o=10;function de(e,t,{onPick:o,inspect:n=!0}={}){let s=e.getContext("2d"),d={canvas:e,ctx:s,hover:null,data:null,draw:t,dirty:!0},v=()=>{let m=Math.min(window.devicePixelRatio||1,2),p=e.clientWidth,b=e.clientHeight;if(!p||!b)return;let T=Math.round(p*m),$=Math.round(b*m);(e.width!==T||e.height!==$)&&(e.width=T,e.height=$),s.setTransform(m,0,0,m,0,0),d.w=p,d.h=b,d.render()};d.render=()=>{if(!(!d.w||!d.h)){s.clearRect(0,0,d.w,d.h);try{t(s,d.w,d.h,d.hover,d.data)}catch(m){console.error("[chart]",m.stack||m)}}},d.update=m=>{d.data=m,d.render()};let g=new ResizeObserver(v);g.observe(e),n&&(e.style.touchAction="pan-y");let y=m=>{let p=e.getBoundingClientRect();return{x:m.clientX-p.left,y:m.clientY-p.top}},w=m=>!!m.pointerType&&m.pointerType!=="mouse",i=(m,p)=>{d.hover={x:m.x,y:m.y,coarse:p},d.render()},c=()=>{tt.delete(d),d.hover=null,d.render()},M=null,f=m=>{if(!w(m)){i(y(m),!1);return}M&&(M.moved=Math.max(M.moved,Math.hypot(m.clientX-M.cx,m.clientY-M.cy)),n&&i(y(m),!0))},l=m=>{let p=y(m);if(M={x:p.x,y:p.y,cx:m.clientX,cy:m.clientY,moved:0,coarse:w(m)},!M.coarse||!n)return;let b=d.hover;M.dismiss=!!b&&!!b.coarse&&Math.abs(b.x-p.x)<14&&Math.abs(b.y-p.y)<14;for(let T of tt)T!==d&&(T.hover=null,T.render());tt.clear(),tt.add(d),i(p,!0)},h=m=>{let p=M;M=null,p&&(p.coarse&&n&&p.dismiss&&p.moved<_o&&c(),o&&p.moved<_o&&o({x:p.x,y:p.y,w:d.w,h:d.h},m))},a=()=>{M&&M.coarse&&n&&c(),M=null},u=m=>{w(m)||(d.hover=null,d.render())};return e.addEventListener("pointermove",f),e.addEventListener("pointerdown",l),e.addEventListener("pointerup",h),e.addEventListener("pointercancel",a),e.addEventListener("pointerleave",u),o&&(e.style.cursor="crosshair"),d.destroy=()=>{g.disconnect(),tt.delete(d),e.removeEventListener("pointermove",f),e.removeEventListener("pointerdown",l),e.removeEventListener("pointerup",h),e.removeEventListener("pointercancel",a),e.removeEventListener("pointerleave",u)},v(),d}function Te(e,t,o,{width:n=2,glow:s=12,closed:d=!1}={}){if(t.length<2)return;let v=()=>{e.beginPath(),e.moveTo(t[0][0],t[0][1]);for(let g=1;g<t.length;g++)e.lineTo(t[g][0],t[g][1]);d&&e.closePath()};e.lineJoin="round",e.lineCap="round",s&&(e.save(),e.shadowColor=o,e.shadowBlur=s/2,e.strokeStyle=V(o,.55),e.lineWidth=n,v(),e.stroke(),e.restore()),e.strokeStyle=o,e.lineWidth=n,v(),e.stroke()}function Ne(e,t){if(!(t.length<2)){e.moveTo(t[0][0],t[0][1]);for(let o=0;o<t.length-1;o++){let n=t[Math.max(0,o-1)],s=t[o],d=t[o+1],v=t[Math.min(t.length-1,o+2)];e.bezierCurveTo(s[0]+(d[0]-n[0])/6,s[1]+(d[1]-n[1])/6,d[0]-(v[0]-s[0])/6,d[1]-(v[1]-s[1])/6,d[0],d[1])}}}function Ie(e,t,o,n=String,{color:s=uo,label:d=!0}={}){e.save(),e.strokeStyle=s,e.lineWidth=1,e.font=ke,e.fillStyle=se,e.textAlign="right",e.textBaseline="middle";let v=-1e9;for(let{v:g,y}of o){if(e.beginPath(),e.moveTo(t.x,Math.round(y)+.5),e.lineTo(t.x+t.w,Math.round(y)+.5),e.stroke(),!d)continue;let w=y-t.y<9?y+6:y-5;Math.abs(w-v)<14||(Le(e,n(g),t.x+t.w-2,w),v=w)}e.restore()}function Ke(e,t,o,n,s,d,v=3){let g=Math.abs(s-o);if(g<.4)return;let y=Math.min(v,n/2,g);e.beginPath(),e.moveTo(t,s),e.lineTo(t,o+y),e.quadraticCurveTo(t,o,t+y,o),e.lineTo(t+n-y,o),e.quadraticCurveTo(t+n,o,t+n,o+y),e.lineTo(t+n,s),e.closePath(),e.fillStyle=d,e.save(),e.globalAlpha*=.6,e.fill(),e.clip(),e.globalAlpha/=.6,e.fillRect(t,o,n,Math.min(2.5,g)),e.restore()}function Le(e,t,o,n,s=3){e.save(),e.lineWidth=s,e.lineJoin="round",e.strokeStyle=V(Bo,.9),e.strokeText(t,o,n),e.restore(),e.fillText(t,o,n)}function Se(e,t,o,n,s=se,d="left"){e.save(),e.font=we,e.fillStyle=s,e.textAlign=d,e.textBaseline="top",e.letterSpacing="1.4px",Le(e,n.toUpperCase(),t,o),e.restore()}function ot(e,t,o,n,s,d,v="#3fd0d8",{pin:g=!1}={}){e.save(),e.font=ta;let i=Math.max(...n.map(h=>e.measureText(h.replace(/\|/g,"  ")).width))+14,c=n.length*13+14-2,M,f;g?(M=t>s/2?4:Math.max(4,s-i-4),f=o<d/2?Math.max(4,d-c-4):4):(M=t+12,f=N(o-c-10,4,d-c-4),M+i>s-4&&(M=t-i-12),M=N(M,4,Math.max(4,s-i-4))),e.fillStyle=V(Bo,.94),e.strokeStyle=V(v,.5),e.lineWidth=1;let l=5;e.beginPath(),e.moveTo(M,f+l),e.lineTo(M+l,f),e.lineTo(M+i,f),e.lineTo(M+i,f+c-l),e.lineTo(M+i-l,f+c),e.lineTo(M,f+c),e.closePath(),e.fill(),e.stroke(),e.textBaseline="top",n.forEach((h,a)=>{let[u,m]=h.split("|");e.textAlign="left",e.fillStyle=a===0?v:pe,e.fillText(u,M+7,f+7+a*13),m!=null&&(e.textAlign="right",e.fillStyle=a===0?v:ye,e.fillText(m,M+i-7,f+7+a*13))}),e.restore()}function oa(e,t,o,n,{align:s="left"}={}){e.save(),e.font=we,e.textBaseline="middle",e.letterSpacing="1.2px";let d=0,v=n.map(y=>{let w=e.measureText(y.label.toUpperCase()).width+16;return d+=w,w}),g=s==="right"?t-d:t;n.forEach((y,w)=>{e.fillStyle=y.color,y.dash?(e.strokeStyle=y.color,e.lineWidth=2,e.setLineDash([3,2]),e.beginPath(),e.moveTo(g,o),e.lineTo(g+9,o),e.stroke(),e.setLineDash([])):e.fillRect(g,o-3,9,3),e.fillStyle=pe,e.textAlign="left",e.fillText(y.label.toUpperCase(),g+13,o),g+=v[w]}),e.restore()}function Uo(e,t,o,n,s){e.save(),e.fillStyle="rgba(8,13,22,.32)";for(let d of o){if(!d.sunset||!d.sunrise)continue;let v=o[o.indexOf(d)+1],g=n(d.sunset),y=v?.sunrise?n(v.sunrise):t.x+t.w,w=N(g,t.x,t.x+t.w),i=N(y,t.x,t.x+t.w);i>w&&e.fillRect(w,t.y,i-w,t.h)}e.restore()}function Nt(e,t,o,n,s,{dash:d=null,flagTop:v=!0}={}){if(e.save(),e.strokeStyle=n,e.lineWidth=1,d&&e.setLineDash(d),e.shadowColor=n,e.shadowBlur=4,e.beginPath(),e.moveTo(Math.round(t)+.5,o.y),e.lineTo(Math.round(t)+.5,o.y+o.h),e.stroke(),e.restore(),s){e.save(),e.font=we,e.letterSpacing="1.2px";let g=e.measureText(s).width+8,y=N(t-g/2,o.x,o.x+o.w-g),w=v?o.y:o.y+o.h-11;e.fillStyle=n,e.fillRect(y,w,g,11),e.fillStyle=ea,e.textAlign="center",e.textBaseline="middle",e.fillText(s,y+g/2,w+6),e.restore()}}function Ue(e,t=4){return N(Math.floor(e/26),1,t)}function Ht(e,t,o,{gap:n=8,least:s=1}={}){if(e<2||t<=0)return s;let d=t/(e-1);return Math.max(s,Math.ceil((o+n)/Math.max(d,.5)))}function He(e,t,o,n,s,d){let v=e.measureText(t).width;return v>d-s?!1:(e.fillText(t,N(o,s+v/2,d-v/2),n),!0)}function wt(e,t,o,n,s=[],{short:d=null}={}){let v=(c,M)=>{e.save(),e.font=we,e.letterSpacing=c;let f=e.measureText(String(M).toUpperCase()).width;return e.restore(),f},g=(c,M)=>v("1.4px",c)+M.reduce((f,l)=>f+v("1.2px",l.label)+16,0)+14,y=s.map(c=>c.short?{...c,label:c.short}:c),[w,i]=[[n,s],[n,y],[d??n,y],[d??n,[]]].find(([c,M])=>g(c,M)<=t.w)??[d??n,[]];Se(e,t.x+2,o,w),i.length&&oa(e,t.x+t.w,o+5,i,{align:"right"})}function Ge(e,t,o=4){if(!Number.isFinite(e)||!Number.isFinite(t)||e===t)return[e||0];let s=(t-e)/o,d=Math.pow(10,Math.floor(Math.log10(s))),v=s/d,g=(v<1.5?1:v<3?2:v<7?5:10)*d,y=[];for(let w=Math.ceil(e/g)*g;w<=t+1e-9;w+=g)y.push(+w.toFixed(6));return y}function Ye(e,t,o,n,{value:s,min:d=0,max:v=100,color:g=j[0],label:y="",unit:w="",bands:i=null,sub:c="",decimals:M=0,ticks:f=5}){let l=Math.PI*.75,h=Math.PI*2.25,a=s==null?0:N((s-d)/(v-d),0,1),u=l+(h-l)*a;if(e.save(),e.lineCap="butt",e.beginPath(),e.arc(t,o,n,l,h),e.strokeStyle="rgba(255,255,255,.07)",e.lineWidth=6,e.stroke(),i)for(let T of i){let $=N((T.from-d)/(v-d),0,1),k=N((T.to-d)/(v-d),0,1);k<=$||(e.beginPath(),e.arc(t,o,n+6,l+(h-l)*$,l+(h-l)*k),e.strokeStyle=V(T.color,.55),e.lineWidth=2.5,e.stroke())}e.strokeStyle="rgba(255,255,255,.14)",e.lineWidth=1;for(let T=0;T<=f;T++){let $=l+(h-l)*(T/f),k=Math.cos($),L=Math.sin($);e.beginPath(),e.moveTo(t+k*(n-5),o+L*(n-5)),e.lineTo(t+k*(n-10),o+L*(n-10)),e.stroke()}if(s!=null&&a>.001){e.save(),e.shadowColor=g,e.shadowBlur=7,e.beginPath(),e.arc(t,o,n,l,u),e.strokeStyle=g,e.lineWidth=6,e.stroke(),e.restore();let T=Math.cos(u),$=Math.sin(u);e.beginPath(),e.arc(t+T*n,o+$*n,3.2,0,Math.PI*2),e.fillStyle=ye,e.shadowColor=g,e.shadowBlur=5,e.fill(),e.shadowBlur=0}e.textAlign="center",e.textBaseline="alphabetic",e.fillStyle=ye,e.font=`700 ${Math.round(n*.62)}px 'JetBrains Mono', monospace`;let m=s==null?"--":s.toFixed(M),p=o+n*.18,b=e.measureText(m).actualBoundingBoxDescent;if(e.fillText(m,t,p),w){e.font=ke,e.fillStyle=pe;let T=e.measureText(w).actualBoundingBoxAscent;e.fillText(w,t,Math.max(o+n*.46,p+b+T+3))}y&&(e.font=we,e.fillStyle=se,e.letterSpacing="1.4px",e.fillText(y.toUpperCase(),t,o+n+15)),c&&(e.font=we,e.fillStyle=g,e.letterSpacing="1.2px",Le(e,c.toUpperCase(),t,o-n*.42)),e.restore()}function Go(e,t,o,{color:n=j[0],fill:s=!0,width:d=1.8,min:v=null,max:g=null,glow:y=8}){let w=o.filter(l=>l!=null);if(w.length<2)return;let i=v??Math.min(...w),M=(g??Math.max(...w))-i||1,f=o.map((l,h)=>[t.x+h/(o.length-1)*t.w,t.y+t.h-((l??i)-i)/M*t.h]);if(s){e.save(),e.beginPath(),Ne(e,f),e.lineTo(f.at(-1)[0],t.y+t.h),e.lineTo(f[0][0],t.y+t.h),e.closePath();let l=e.createLinearGradient(0,t.y,0,t.y+t.h);l.addColorStop(0,V(n,.34)),l.addColorStop(1,V(n,0)),e.fillStyle=l,e.fill(),e.restore()}return e.save(),y&&(e.shadowColor=n,e.shadowBlur=y/2),e.beginPath(),Ne(e,f),e.strokeStyle=n,e.lineWidth=d,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore(),f}function qo(e,t,o,n,{dir:s,speed:d,gust:v,color:g=j[0]}){e.save(),e.strokeStyle="rgba(255,255,255,.09)",e.lineWidth=1,e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.stroke(),e.font=we,e.fillStyle=se,e.textAlign="center",e.textBaseline="middle";for(let[c,M]of[["N",-90],["E",0],["S",90],["W",180]]){let f=M*Math.PI/180;e.fillText(c,t+Math.cos(f)*(n+8),o+Math.sin(f)*(n+8))}for(let c=0;c<16;c++){let M=(c*22.5-90)*Math.PI/180,f=c%4===0;e.strokeStyle=f?"rgba(255,255,255,.20)":"rgba(255,255,255,.09)",e.beginPath(),e.moveTo(t+Math.cos(M)*n,o+Math.sin(M)*n),e.lineTo(t+Math.cos(M)*(n-(f?7:4)),o+Math.sin(M)*(n-(f?7:4))),e.stroke()}if(s!=null){let c=(s-90+180)*Math.PI/180,M=n-10;e.save(),e.translate(t,o),e.rotate(c),e.shadowColor=g,e.shadowBlur=6,e.fillStyle=g,e.beginPath(),e.moveTo(M,0),e.lineTo(M-9,-5.5),e.lineTo(M-6,0),e.lineTo(M-9,5.5),e.closePath(),e.fill(),e.strokeStyle=g,e.lineWidth=2,e.beginPath(),e.moveTo(-M*.55,0),e.lineTo(M-7,0),e.stroke(),e.restore()}e.textAlign="center",e.textBaseline="alphabetic",e.fillStyle=ye,e.font=`700 ${Math.round(n*.44)}px 'JetBrains Mono', monospace`;let y=d==null?"--":String(Math.round(d)),w=o+n*.06,i=e.measureText(y).actualBoundingBoxDescent;e.fillText(y,t,w),e.font=ke,e.fillStyle=pe,e.fillText("mph",t,Math.max(o+n*.3,w+i+e.measureText("mph").actualBoundingBoxAscent+3)),v!=null&&v>(d??0)+1&&(e.font=ke,e.fillStyle=R.serious,e.fillText(`G${Math.round(v)}`,t,o-n*.26)),e.restore()}function Ft(e,t,o,n,s,d){e.save(),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.fillStyle="#16212f",e.fill(),e.strokeStyle="rgba(127,178,240,.22)",e.lineWidth=1,e.stroke();let v=1-2*N(d,0,1),g=s<.5;e.save(),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.clip(),e.beginPath();let y=48;for(let i=0;i<=y;i++){let c=-1+2*i/y,M=v*Math.sqrt(Math.max(0,1-c*c)),f=t+(g?M:-M)*n;i===0?e.moveTo(f,o+c*n):e.lineTo(f,o+c*n)}for(let i=y;i>=0;i--){let c=-1+2*i/y;e.lineTo(t+(g?1:-1)*Math.sqrt(Math.max(0,1-c*c))*n,o+c*n)}e.closePath();let w=e.createRadialGradient(t-n*.25,o-n*.25,n*.1,t,o,n);w.addColorStop(0,"#f2f6ff"),w.addColorStop(1,"#b9c6da"),e.fillStyle=w,e.shadowColor="rgba(200,225,255,.7)",e.shadowBlur=n*.5,e.fill(),e.shadowBlur=0,e.globalCompositeOperation="multiply",e.fillStyle="rgba(150,165,190,.55)";for(let[i,c,M]of[[-.28,-.2,.26],[.1,-.34,.18],[.22,.1,.22],[-.15,.3,.16],[-.42,.12,.13]])e.beginPath(),e.arc(t+i*n,o+c*n,M*n,0,Math.PI*2),e.fill();e.restore(),e.restore()}function Vo(e,t,o,n,{sunTrack:s=[],moonTrack:d=[],sun:v=null,moon:g=null,iss:y=null,night:w=0}){let i=(l,h)=>{let a=(1-N(h,0,90)/90)*n,u=(l-90)*Math.PI/180;return[t+Math.cos(u)*a,o+Math.sin(u)*a]};e.save();let c=e.createRadialGradient(t,o,0,t,o,n);c.addColorStop(0,w>.5?"rgba(6,12,30,.85)":"rgba(10,40,72,.55)"),c.addColorStop(1,w>.5?"rgba(2,4,12,.6)":"rgba(6,20,40,.4)"),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.fillStyle=c,e.fill(),e.strokeStyle="rgba(255,255,255,.10)",e.lineWidth=1;for(let l of[30,60])e.beginPath(),e.arc(t,o,(1-l/90)*n,0,Math.PI*2),e.stroke();e.strokeStyle="rgba(63,208,216,.28)",e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.stroke(),e.font=we,e.textAlign="center",e.textBaseline="middle";for(let[l,h]of[["N",0],["E",90],["S",180],["W",270]]){let[a,u]=i(h,0);e.strokeStyle="rgba(255,255,255,.07)",e.beginPath(),e.moveTo(t,o),e.lineTo(a,u),e.stroke();let[m,p]=i(h,-9);e.fillStyle=se,e.fillText(l,m,p)}let M=(l,h,a)=>{let u=[],m=()=>{u.length>1&&(e.save(),a&&e.setLineDash(a),Te(e,u,h,{width:1.5,glow:6}),e.restore()),u=[]};for(let p of l){if(p.alt<0){m();continue}u.push(i(p.az,p.alt))}m()};M(s,"#f2b45a",null),M(d,"#7fb2f0",[3,3]);let f=(l,h,a)=>{if(!l||l.alt<-2)return;let[u,m]=i(l.az,Math.max(0,l.alt));e.save(),e.shadowColor=h,e.shadowBlur=8,e.fillStyle=h,e.beginPath(),e.arc(u,m,a,0,Math.PI*2),e.fill(),e.restore(),l.alt<0&&(e.strokeStyle=V(h,.5),e.setLineDash([2,2]),e.beginPath(),e.arc(u,m,a+3,0,Math.PI*2),e.stroke(),e.setLineDash([]))};if(f(g,"#c9d8f5",5),f(v,"#efc865",6.5),y){let[l,h]=i(y.az,Math.max(0,y.alt));e.save(),e.strokeStyle="#8fdc6a",e.lineWidth=1.5,e.shadowColor="#8fdc6a",e.shadowBlur=5,e.beginPath(),e.arc(l,h,4,0,Math.PI*2),e.stroke(),e.beginPath(),e.moveTo(l-7,h),e.lineTo(l+7,h),e.stroke(),e.restore()}e.restore()}var nt=8,jo=8,Ko=16,Yo=15;function xo(e){e.innerHTML=`
    <div class="tl-controls">
      <button class="tl-btn" data-act="back" title="Back 1 hour  [\u2190]">\u25C0\u25C0</button>
      <button class="tl-btn tl-play" data-act="play" title="Play forecast  [Space]">\u25B6</button>
      <button class="tl-btn" data-act="fwd" title="Forward 1 hour  [\u2192]">\u25B6\u25B6</button>
      <button class="tl-btn tl-now" data-act="now" title="Return to now  [N]">NOW</button>
      <div class="tl-rate">
        <span class="lbl">rate</span>
        <button class="tl-btn sm" data-rate="1">1\xD7</button>
        <button class="tl-btn sm" data-rate="3">3\xD7</button>
        <button class="tl-btn sm" data-rate="12">12\xD7</button>
      </div>
    </div>
    <div class="tl-readout">
      <div class="tl-when"><b>--</b><span>--</span></div>
      <div class="tl-delta">NOW</div>
    </div>
    <canvas class="tl-canvas"></canvas>
  `;let t=e.querySelector(".tl-canvas"),o=e.querySelector(".tl-when b"),n=e.querySelector(".tl-when span"),s=e.querySelector(".tl-delta"),d=e.querySelector(".tl-play"),v=!1,g=de(t,w,{inspect:!1});function y(l){let{lo:h,hi:a}=r.span,u=l-nt-jo;return{lo:h,hi:a,plotW:u,xOf:m=>nt+(m-h)/(a-h||1)*u,tOf:m=>h+(m-nt)/u*(a-h||1)}}function w(l,h,a,u){let m=r.hours;if(!m?.length)return;let p=y(h),b=r.fmt,T={x:nt,y:Ko,w:p.plotW,h:a-Ko-Yo};l.save(),l.fillStyle="rgba(8,13,22,.4)";for(let F=0;F<r.days.length;F++){let J=r.days[F],Q=r.days[F+1];if(!J.sunset)continue;let Z=N(p.xOf(J.sunset),T.x,T.x+T.w),x=N(Q?.sunrise?p.xOf(Q.sunrise):T.x+T.w,T.x,T.x+T.w);x>Z&&l.fillRect(Z,T.y,x-Z,T.h)}l.restore();let $=m.map(F=>F.temp).filter(F=>F!=null),k=Math.min(...$),L=Math.max(...$),H=F=>T.y+T.h*.92-(F-k)/(L-k||1)*T.h*.72,A=m.filter(F=>F.temp!=null).map(F=>[p.xOf(F.t),H(F.temp)]);l.save(),l.beginPath(),Ne(l,A),l.lineTo(A.at(-1)[0],T.y+T.h),l.lineTo(A[0][0],T.y+T.h),l.closePath();let C=l.createLinearGradient(0,T.y,0,T.y+T.h);C.addColorStop(0,V(Ae(L),.34)),C.addColorStop(1,V(Ae(k),.03)),l.fillStyle=C,l.fill(),l.restore();let O=l.createLinearGradient(nt,0,nt+p.plotW,0);for(let F=0;F<=12;F++){let J=m[Math.round(F/12*(m.length-1))];O.addColorStop(F/12,Ae(J?.temp))}l.save(),l.shadowColor=V(j[0],.8),l.shadowBlur=4,l.beginPath(),Ne(l,A),l.strokeStyle=O,l.lineWidth=1.8,l.lineJoin="round",l.stroke(),l.restore();let E=Math.max(...m.map(F=>F.precip??0),.02);l.save();for(let F of m){let J=F.precip??0;if(J<.001)continue;let Q=p.xOf(F.t),Z=N(J/E,.08,1)*T.h*.3;l.fillStyle=V(j[4],.75),l.fillRect(Q-.7,T.y+T.h-Z,1.6,Z)}l.restore(),l.save(),l.font=we,l.letterSpacing="1.2px",l.textBaseline="top";let D=r.days.length>1?Math.abs(p.xOf(r.days[1].t)-p.xOf(r.days[0].t)):T.w,z=34,U=Math.max(1,Math.ceil(z/Math.max(1,D))),W=0;for(let F of r.days){let J=p.xOf(F.t),Q=W++%U===0;J<T.x||J>T.x+T.w||(l.strokeStyle=Q?"rgba(255,255,255,.10)":"rgba(255,255,255,.05)",l.lineWidth=1,l.beginPath(),l.moveTo(Math.round(J)+.5,T.y),l.lineTo(Math.round(J)+.5,T.y+T.h),l.stroke(),!(!Q||J+z>T.x+T.w)&&(l.fillStyle=se,l.textAlign="left",l.fillText(b.weekday(F.t).toUpperCase(),J+3,a-Yo+3)))}l.restore();for(let F of r.alerts){let J=Date.parse(F.effective||F.onset||0),Q=Date.parse(F.expires||F.ends||0);if(!J||!Q)continue;let Z=N(p.xOf(J),T.x,T.x+T.w),x=N(p.xOf(Q),T.x,T.x+T.w);x<=Z||(l.fillStyle=V(R.crit,.55),l.fillRect(Z,T.y-4,x-Z,3))}let P=Date.now(),q=p.xOf(P);if(q>=T.x&&q<=T.x+T.w&&(l.save(),l.strokeStyle=V(R.good,.85),l.lineWidth=1,l.setLineDash([2,3]),l.shadowColor=R.good,l.shadowBlur=4,l.beginPath(),l.moveTo(Math.round(q)+.5,T.y-4),l.lineTo(Math.round(q)+.5,T.y+T.h),l.stroke(),l.restore()),u&&!v&&u.x>T.x&&u.x<T.x+T.w){let F=p.tOf(u.x);l.save(),l.strokeStyle="rgba(255,255,255,.22)",l.lineWidth=1,l.beginPath(),l.moveTo(Math.round(u.x)+.5,T.y),l.lineTo(Math.round(u.x)+.5,T.y+T.h),l.stroke(),l.font=ke,l.fillStyle=pe,l.textAlign=u.x>h-70?"right":"left",l.textBaseline="top",l.fillText(`${b.weekday(F)} ${b.hm(F)}`,u.x+(u.x>h-70?-5:5),2),l.restore()}let te=p.xOf(r.cursor);l.save(),l.strokeStyle=j[1],l.lineWidth=1.5,l.shadowColor=j[1],l.shadowBlur=7,l.beginPath(),l.moveTo(Math.round(te)+.5,T.y-6),l.lineTo(Math.round(te)+.5,T.y+T.h+3),l.stroke(),l.fillStyle=j[1],l.beginPath(),l.moveTo(te,T.y-10),l.lineTo(te+5,T.y-16),l.lineTo(te-5,T.y-16),l.closePath(),l.fill(),l.restore()}let i=l=>{let h=t.getBoundingClientRect(),a=y(h.width);r.playing=!1,M(),r.scrubTo(a.tOf(N(l-h.left,nt,h.width-jo)))};t.addEventListener("pointerdown",l=>{v=!0,t.setPointerCapture(l.pointerId),i(l.clientX)}),t.addEventListener("pointermove",l=>{v&&i(l.clientX)});let c=l=>{if(v){v=!1;try{t.releasePointerCapture(l.pointerId)}catch{}}};t.addEventListener("pointerup",c),t.addEventListener("pointercancel",c),t.style.cursor="ew-resize",e.addEventListener("click",l=>{let h=l.target.closest("button");if(!h)return;if(h.dataset.rate){r.playRate=+h.dataset.rate,e.querySelectorAll("[data-rate]").forEach(u=>u.classList.toggle("on",+u.dataset.rate===r.playRate));return}let a=h.dataset.act;a==="now"?r.toNow():a==="back"?(r.playing=!1,r.scrubTo(r.cursor-36e5)):a==="fwd"?(r.playing=!1,r.scrubTo(r.cursor+36e5)):a==="play"&&(r.playing=!r.playing,r.playing&&r.view!=="radar"&&(r.following=!1),r.playing&&r.cursor>=r.span.hi-6e4&&r.setCursor(Date.now()),r.emit("play",r.playing)),M()});function M(){d.textContent=r.playing?"\u275A\u275A":"\u25B6",d.classList.toggle("on",r.playing),e.querySelector(".tl-now").classList.toggle("on",r.atNow)}function f(){let l=r.fmt,h=r.cursor;o.textContent=l.hm12(h),n.textContent=`${l.weekday(h)} ${l.monthDay(h)}`;let a=h-Date.now(),u=Math.round(Math.abs(a)/6e4);if(u<3)s.textContent="NOW",s.className="tl-delta now";else{let m=Math.floor(u/60),p=u%60,b=m>=24?`${Math.floor(m/24)}d ${m%24}h`:m?`${m}h ${p}m`:`${p}m`;s.textContent=a>0?`+${b}`:`\u2212${b}`,s.className="tl-delta "+(a>0?"fwd":"back")}M()}return r.on("cursor",()=>{f(),g.render()}),r.on("data",()=>{f(),g.render()}),r.on("play",M),e.querySelector('[data-rate="1"]').classList.add("on"),f(),{render:()=>g.render(),tick(l){if(!r.playing||r.view==="radar")return;let h=r.cursor+l*1e3*3600*r.playRate;h>=r.span.hi?(r.setCursor(r.span.hi),r.playing=!1,r.emit("play",!1),M()):r.setCursor(h)}}}function zt(e,t,o,n,s){let{hours:d,days:v,span:g,cursor:y,now:w,tf:i,panels:c=["temp","pop"],showAxis:M=!0}=s;if(!d?.length)return;let f=4,l=30,h=14,a=M?30:4,u=t-f-l;if(u<30)return;let m=d.filter(E=>E.t>=g.lo-36e5&&E.t<=g.hi+36e5);if(m.length<2)return;let p=E=>f+(E-g.lo)/(g.hi-g.lo)*u,b=E=>g.lo+(E-f)/u*(g.hi-g.lo),T={temp:1,pop:.42,wind:.42,cloud:.3,pressure:.42,uv:.36,cape:.36},$=c.reduce((E,D)=>E+(T[D]||.4),0),k=c.length>2?16:9,L=o-h-a-(c.length-1)*k,H=h,A={};for(let E of c){let D=L*(T[E]||.4)/$;A[E]={x:f,y:H,w:u,h:D},H+=D+k}let C={x:f,y:h,w:u,h:o-h-a};if(Uo(e,C,v||[],p),v?.length){e.save(),e.strokeStyle="rgba(255,255,255,.07)",e.lineWidth=1,e.font=we,e.letterSpacing="1.2px",e.textBaseline="top";for(let E of v){let D=p(E.t);D<f-1||D>f+u||(e.beginPath(),e.moveTo(Math.round(D)+.5,h),e.lineTo(Math.round(D)+.5,h+C.h),e.stroke(),M&&(e.fillStyle=se,e.textAlign="left",e.fillText(i.weekday(E.t).toUpperCase(),D+3,o-a+17)))}e.restore()}let O=[];if(A.temp){let E=A.temp,D=m.map(Z=>Z.temp).filter(Z=>Z!=null),z=m.map(Z=>Z.feels).filter(Z=>Z!=null),U=D.concat(z),W=Math.min(...U)-2,P=Math.max(...U)+2,q=Z=>E.y+E.h-(Z-W)/(P-W)*E.h;if(Ie(e,E,Ge(W,P,Ue(E.h,3)).map(Z=>({v:Z,y:q(Z)})),Z=>`${Math.round(Z)}\xB0`),z.length>1){e.save(),e.setLineDash([4,3]);let Z=m.filter(x=>x.feels!=null).map(x=>[p(x.t),q(x.feels)]);Te(e,Z,V(j[1],.75),{width:1.5,glow:6}),e.restore()}let te=m.filter(Z=>Z.temp!=null).map(Z=>[p(Z.t),q(Z.temp)]);e.save(),e.beginPath(),Ne(e,te),e.lineTo(te.at(-1)[0],E.y+E.h),e.lineTo(te[0][0],E.y+E.h),e.closePath();let F=e.createLinearGradient(0,E.y,0,E.y+E.h);F.addColorStop(0,V(Ae(P),.3)),F.addColorStop(1,V(Ae(W),.02)),e.fillStyle=F,e.fill(),e.restore();let J=e.createLinearGradient(f,0,f+u,0);for(let Z=0;Z<=8;Z++){let x=m[Math.round(Z/8*(m.length-1))];J.addColorStop(Z/8,Ae(x?.temp))}e.save(),e.shadowColor=V(j[0],.9),e.shadowBlur=6,e.beginPath(),Ne(e,te),e.strokeStyle=J,e.lineWidth=2.2,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore(),e.save(),e.font=ke,e.textAlign="center",e.textBaseline="bottom";let Q=e.measureText("100\xB0").width+6;for(let Z of v||[]){let x=m.filter(ie=>i.isoDate(ie.t)===i.isoDate(Z.t)&&ie.temp!=null);if(x.length<3)continue;let fe=x.reduce((ie,ve)=>ve.temp>ie.temp?ve:ie),Ce=x.reduce((ie,ve)=>ve.temp<ie.temp?ve:ie);for(let[ie,ve,Oe]of[[fe,-6,"bottom"],[Ce,13,"top"]]){let S=p(ie.t),I=e.measureText(`${Math.round(ie.temp)}\xB0`).width;if(S-I/2<f+4||S+I/2>f+u-Q)continue;let G=q(ie.temp)+ve,_=Oe==="top"?G+9>E.y+E.h:G-9<E.y;e.textBaseline=_?Oe==="top"?"bottom":"top":Oe,e.fillStyle=Ae(ie.temp),Le(e,`${Math.round(ie.temp)}\xB0`,S,_?q(ie.temp)-ve:G)}}e.restore(),wt(e,E,E.y-11,"temperature \xB0F",[{label:"actual",color:j[0]},{label:"feels like",short:"feels",color:j[1],dash:!0}],{short:"temp \xB0F"}),O.push({key:"temp",box:E,yOf:q})}if(A.pop){let E=A.pop,D=q=>E.y+E.h-N(q,0,100)/100*E.h;Ie(e,E,[50,100].map(q=>({v:q,y:D(q)})),q=>`${q}%`);let z=m.map(q=>[p(q.t),D(q.pop??0)]);e.save(),e.beginPath(),Ne(e,z),e.lineTo(z.at(-1)[0],E.y+E.h),e.lineTo(z[0][0],E.y+E.h),e.closePath();let U=e.createLinearGradient(0,E.y,0,E.y+E.h);U.addColorStop(0,V(j[4],.55)),U.addColorStop(1,V(j[4],.04)),e.fillStyle=U,e.fill(),e.restore(),Te(e,z,j[4],{width:1.6,glow:7}),e.save(),e.font=ke,e.textAlign="center",e.textBaseline="bottom",e.fillStyle=j[0];let W=-999,P=e.measureText("100%").width+6;for(let q=1;q<m.length-1;q++){let te=m[q];if((te.precip??0)<.02||(te.precip??0)<=(m[q-1].precip??0)||(te.precip??0)<(m[q+1].precip??0))continue;let F=p(te.t),J=e.measureText(`${te.precip.toFixed(2)}"`).width;F-W<46||F-J/2<f+4||F+J/2>f+u-P||(e.fillText(`${te.precip.toFixed(2)}"`,F,D(te.pop??0)-4),W=F)}e.restore(),Se(e,E.x+2,E.y-11,"precip probability"),O.push({key:"pop",box:E,yOf:D})}if(A.wind){let E=A.wind,D=Math.max(...m.map(P=>P.gust??P.wind??0),10)*1.12,z=P=>E.y+E.h-N(P,0,D)/D*E.h;Ie(e,E,Ge(0,D,Ue(E.h,2)).map(P=>({v:P,y:z(P)})),P=>String(Math.round(P)));let U=m.map(P=>[p(P.t),z(P.gust??P.wind??0)]);e.save(),e.beginPath(),Ne(e,U),e.lineTo(U.at(-1)[0],E.y+E.h),e.lineTo(U[0][0],E.y+E.h),e.closePath(),e.fillStyle=V(R.serious,.16),e.fill(),e.restore(),Te(e,U,V(R.serious,.85),{width:1.2,glow:5}),Te(e,m.map(P=>[p(P.t),z(P.wind??0)]),j[3],{width:1.8,glow:8}),e.save(),e.strokeStyle=V(j[3],.55),e.lineWidth=1;let W=Math.max(1,Math.round(m.length/(u/26)));for(let P=0;P<m.length;P+=W){let q=m[P];if(q.windDir==null)continue;let te=p(q.t),F=E.y+E.h-5,J=(q.windDir-90+180)*Math.PI/180;e.save(),e.translate(te,F),e.rotate(J),e.beginPath(),e.moveTo(-4,0),e.lineTo(4,0),e.moveTo(4,0),e.lineTo(1.5,-2),e.moveTo(4,0),e.lineTo(1.5,2),e.stroke(),e.restore()}e.restore(),wt(e,E,E.y-11,"wind mph",[{label:"sustained",short:"wind",color:j[3]},{label:"gusts",color:R.serious}],{short:"wind"}),O.push({key:"wind",box:E,yOf:z})}if(A.cloud){let E=A.cloud,D=m.length,z=Math.max(1,u/D),U=[["cloudHigh",V(j[4],.55)],["cloudMid",V(j[0],.5)],["cloudLow",V(ye,.45)]];m.forEach((W,P)=>{let q=f+P*u/D,te=E.y,F=E.h/3;U.forEach(([J,Q],Z)=>{let x=N((W[J]??0)/100,0,1);e.fillStyle=Q,e.fillRect(q,te+(F-2)*(1-x),Math.max(1,z-.5),(F-2)*x),te+=F})}),e.save(),e.font=we,e.textAlign="right",e.textBaseline="middle",["HIGH","MID","LOW"].forEach((W,P)=>{let q=E.y+E.h/3*(P+.5);e.fillStyle="rgba(22,33,47,.75)",e.fillRect(E.x+E.w-30,q-5,30,10),e.fillStyle=se,Le(e,W,E.x+E.w-2,q)}),e.restore(),Se(e,E.x+2,E.y-11,"cloud decks %"),O.push({key:"cloud",box:E})}if(A.pressure){let E=A.pressure,D=m.map(P=>P.pressure).filter(P=>P!=null),z=Math.min(...D)-1,U=Math.max(...D)+1,W=P=>E.y+E.h-(P-z)/(U-z)*E.h;Ie(e,E,Ge(z,U,Ue(E.h,2)).map(P=>({v:P,y:W(P)})),P=>(P*.02953).toFixed(2)),Te(e,m.filter(P=>P.pressure!=null).map(P=>[p(P.t),W(P.pressure)]),j[3],{width:1.8,glow:8}),Se(e,E.x+2,E.y-11,"pressure inHg"),O.push({key:"pressure",box:E,yOf:W})}if(A.uv){let E=A.uv,D=W=>E.y+E.h-N(W,0,12)/12*E.h;Ie(e,E,[3,6,8,11].map(W=>({v:W,y:D(W)})),String);let z=m.length,U=Math.max(1,u/z-1);m.forEach((W,P)=>{let q=W.uv??0;if(q<=.05)return;let te=f+P*u/z,F=q<3?R.good:q<6?R.warn:q<8?R.serious:q<11?R.crit:j[3];Ke(e,te,D(q),U,E.y+E.h,V(F,.8))}),Se(e,E.x+2,E.y-11,"uv index"),O.push({key:"uv",box:E,yOf:D})}if(A.cape){let E=A.cape,D=Math.max(...m.map(W=>W.cape??0),500)*1.1,z=W=>E.y+E.h-N(W,0,D)/D*E.h;Ie(e,E,Ge(0,D,Ue(E.h,2)).map(W=>({v:W,y:z(W)})),W=>String(Math.round(W)));let U=m.map(W=>[p(W.t),z(W.cape??0)]);e.save(),e.beginPath(),Ne(e,U),e.lineTo(U.at(-1)[0],E.y+E.h),e.lineTo(U[0][0],E.y+E.h),e.closePath(),e.fillStyle=V(R.crit,.18),e.fill(),e.restore(),Te(e,U,R.crit,{width:1.6,glow:7}),Se(e,E.x+2,E.y-11,"CAPE J/kg"),O.push({key:"cape",box:E,yOf:z})}if(M){e.save(),e.font=ke,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let E=(g.hi-g.lo)/36e5,D=E>200?24:E>96?12:E>40?6:E>16?3:1,z=e.measureText("00:00").width+8,U=u/Math.max(E,1),W=[1,3,6,12,24,48].filter(P=>P>=D).find(P=>P*U>=z)??48;for(let P of m){let q=i.hourOfDay(P.t);if(Math.abs(q-Math.round(q))>.01||Math.round(q)%W!==0)continue;let te=p(P.t);te<f+10||te>f+u-10||e.fillText(i.hm(P.t),te,o-a+4)}e.restore()}if(w!=null&&w>=g.lo&&w<=g.hi&&Nt(e,p(w),C,V(R.good,.9),"NOW",{dash:[3,3]}),y!=null&&Math.abs(y-(w??y))>9e4&&y>=g.lo&&y<=g.hi&&Nt(e,p(y),C,j[1],null),n&&n.x>f&&n.x<f+u){let E=b(n.x),D=Zo(m,E);if(D){let z=p(D.t);e.save(),e.strokeStyle="rgba(255,255,255,.35)",e.setLineDash([2,3]),e.lineWidth=1,e.beginPath(),e.moveTo(Math.round(z)+.5,h),e.lineTo(Math.round(z)+.5,h+C.h),e.stroke(),e.restore();for(let W of O){if(!W.yOf)continue;let P=W.key==="temp"?D.temp:W.key==="pop"?D.pop??0:W.key==="wind"?D.wind:W.key==="pressure"?D.pressure:W.key==="uv"?D.uv:W.key==="cape"?D.cape:null;P!=null&&(e.save(),e.fillStyle=ye,e.shadowColor=j[0],e.shadowBlur=5,e.beginPath(),e.arc(z,W.yOf(P),3.5,0,Math.PI*2),e.fill(),e.restore())}let U=[`${i.weekday(D.t)} ${i.hm(D.t)}|`];A.temp&&(U.push(`TEMP|${Y.temp(D.temp)}`),U.push(`FEELS|${Y.temp(D.feels)}`)),A.pop&&(U.push(`RAIN CHANCE|${Y.pct(D.pop)}`),(D.precip??0)>.001&&U.push(`AMOUNT|${Y.inches(D.precip)}"`)),A.wind&&U.push(`WIND|${Y.wind(D.wind)} ${me(D.windDir)}`),A.pressure&&U.push(`PRESSURE|${Y.pressure(D.pressure)}`),A.uv&&U.push(`UV|${D.uv?.toFixed(1)??"--"}`),A.cape&&U.push(`CAPE|${Math.round(D.cape??0)}`),U.push(`SKY|${et(Math.round(D.code??0)).label}`),ot(e,z,n.y,U,t,o,"#3fd0d8",{pin:n.coarse})}}return{xOf:p,tOf:b,boxes:A}}function Zo(e,t){let o=null,n=1/0;for(let s of e){let d=Math.abs(s.t-t);d<n&&(n=d,o=s)}return o}function Jo(e,t,o,n,{rows:s,tf:d,now:v}){if(!s?.length)return;let g=4,y=34,w=16,i=20,c={x:g,y:w,w:t-g-y,h:o-w-i};if(c.w<30||c.h<20)return;let M=Math.min(...s.map($=>$.min)),f=Math.max(...s.map($=>$.max)),l=M-2,h=f+2,a=$=>c.x+($-s[0].t)/(s.at(-1).t-s[0].t)*c.w,u=$=>c.y+c.h-($-l)/(h-l)*c.h;Ie(e,c,Ge(l,h,Ue(c.h,4)).map($=>({v:$,y:u($)})),$=>`${Math.round($)}\xB0`),e.save(),e.beginPath(),s.forEach(($,k)=>k?e.lineTo(a($.t),u($.max)):e.moveTo(a($.t),u($.max)));for(let $=s.length-1;$>=0;$--)e.lineTo(a(s[$].t),u(s[$].min));e.closePath();let m=e.createLinearGradient(c.x,0,c.x+c.w,0);m.addColorStop(0,V(j[0],.3)),m.addColorStop(1,V(j[0],.1)),e.fillStyle=m,e.fill(),e.strokeStyle=V(j[0],.35),e.lineWidth=1,e.stroke(),e.restore(),Te(e,s.map($=>[a($.t),u($.mean)]),j[0],{width:2,glow:10}),e.save(),e.strokeStyle=uo,e.font=ke,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let p="",b=e.measureText("WED").width+8,T=-1e9;for(let $ of s){let k=d.isoDate($.t);if(k===p)continue;p=k;let L=a($.t);e.beginPath(),e.moveTo(L+.5,c.y),e.lineTo(L+.5,c.y+c.h),e.stroke(),!(L<c.x+12||L>c.x+c.w-12||L-T<b)&&(e.fillText(d.weekday($.t).toUpperCase(),L,o-i+5),T=L)}if(e.restore(),v>=s[0].t&&v<=s.at(-1).t&&Nt(e,a(v),c,V(R.good,.9),"NOW",{dash:[3,3]}),wt(e,c,3,"model agreement \xB0F",[{label:"ensemble mean",short:"mean",color:j[0]},{label:"model range",short:"range",color:V(j[0],.35)}],{short:"model spread \xB0F"}),n&&n.x>c.x&&n.x<c.x+c.w){let $=s[0].t+(n.x-c.x)/c.w*(s.at(-1).t-s[0].t),k=Zo(s,$);if(k){let L=a(k.t);e.save(),e.strokeStyle="rgba(255,255,255,.3)",e.setLineDash([2,3]),e.beginPath(),e.moveTo(L+.5,c.y),e.lineTo(L+.5,c.y+c.h),e.stroke(),e.restore();let H=k.spread<2?"HIGH":k.spread<5?"MODERATE":k.spread<9?"LOW":"VERY LOW";ot(e,L,n.y,[`${d.weekday(k.t)} ${d.hm(k.t)}|`,`MEAN|${Y.tempP(k.mean)}`,`RANGE|${Y.temp(k.min)}\u2013${Y.temp(k.max)}`,`SPREAD|${k.spread.toFixed(1)}\xB0`,`CONFIDENCE|${H}`,k.precipAgree!=null?`MODELS WET|${Math.round(k.precipAgree*100)}%`:null].filter(Boolean),t,o,"#3fd0d8",{pin:n.coarse})}}}function Qo(e,t,o,n,{days:s,climate:d,tf:v,doyOf:g}){if(!s?.length||!d?.doy?.length)return;let y=4,w=34,i=16,c=20,M={x:y,y:i,w:t-y-w,h:o-i-c};if(M.w<40||M.h<30)return;let f=s.map(k=>{let L=d.doy[g(k.t)];return L?{...k,c:L}:null}).filter(Boolean);if(!f.length)return;let l=f.flatMap(k=>[k.c.recordHigh,k.c.recordLow,k.tmax,k.tmin]).filter(k=>k!=null),h=Math.min(...l)-3,a=Math.max(...l)+3,u=f.length,m=M.w/u,p=k=>M.x+m*(k+.5),b=k=>M.y+M.h-(k-h)/(a-h)*M.h;Ie(e,M,Ge(h,a,Ue(M.h,4)).map(k=>({v:k,y:b(k)})),k=>`${Math.round(k)}\xB0`),e.save(),e.beginPath(),f.forEach((k,L)=>L?e.lineTo(p(L),b(k.c.recordHigh)):e.moveTo(p(L),b(k.c.recordHigh)));for(let k=u-1;k>=0;k--)e.lineTo(p(k),b(f[k].c.recordLow));e.closePath(),e.fillStyle="rgba(255,255,255,.045)",e.fill(),e.restore(),e.save(),e.beginPath(),f.forEach((k,L)=>L?e.lineTo(p(L),b(k.c.normalHigh)):e.moveTo(p(L),b(k.c.normalHigh)));for(let k=u-1;k>=0;k--)e.lineTo(p(k),b(f[k].c.normalLow));e.closePath(),e.fillStyle="rgba(141,154,171,.20)",e.fill(),e.strokeStyle="rgba(141,154,171,.45)",e.setLineDash([3,3]),e.lineWidth=1,e.stroke(),e.restore();let T=Math.min(15,m*.42);f.forEach((k,L)=>{if(k.tmax==null||k.tmin==null)return;let H=(k.tmax-k.c.normalHigh+(k.tmin-(k.c.normalLow??k.c.normalHigh)))/2,A=N(Math.abs(H)/15,0,1),C=H>=0?We("#8d9aab","#f2b45a",A):We("#8d9aab","#7fb2f0",A),O=p(L)-T/2,E=b(k.tmax),D=b(k.tmin);e.save(),e.shadowColor=C,e.shadowBlur=5,e.fillStyle=C;let z=Math.min(4,T/2);e.beginPath(),e.moveTo(O,D-z),e.lineTo(O,E+z),e.quadraticCurveTo(O,E,O+z,E),e.lineTo(O+T-z,E),e.quadraticCurveTo(O+T,E,O+T,E+z),e.lineTo(O+T,D-z),e.quadraticCurveTo(O+T,D,O+T-z,D),e.lineTo(O+z,D),e.quadraticCurveTo(O,D,O,D-z),e.closePath(),e.fill(),e.restore(),k.tmax>=k.c.recordHigh&&(e.save(),e.fillStyle=R.crit,e.font=ke,e.textAlign="center",e.textBaseline="bottom",Le(e,"REC",p(L),b(k.tmax)-4),e.restore())}),e.save(),e.font=ke,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let $=Ht(u,M.w,e.measureText("WED").width,{least:u>12?2:1});if(f.forEach((k,L)=>{L%$||He(e,v.weekday(k.t).toUpperCase(),p(L),o-c+5,0,t)}),e.restore(),wt(e,M,3,"forecast vs climate record \xB0F",[{label:"forecast",color:"#f2b45a"},{label:"normal",color:"rgba(141,154,171,.7)",dash:!0},{label:"record range",short:"record",color:"rgba(255,255,255,.2)"}],{short:"climate record \xB0F"}),n&&n.x>M.x&&n.x<M.x+M.w){let k=N(Math.floor((n.x-M.x)/m),0,u-1),L=f[k],H=L.tmax-L.c.normalHigh;ot(e,p(k),n.y,[`${v.weekday(L.t)} ${v.monthDay(L.t)}|`,`FORECAST|${Y.temp(L.tmin)} \u2013 ${Y.temp(L.tmax)}`,`NORMAL|${Y.temp(L.c.normalLow)} \u2013 ${Y.temp(L.c.normalHigh)}`,`HIGH vs NORMAL|${Y.signed(H)}\xB0`,`RECORD HIGH|${Y.temp(L.c.recordHigh)} (${L.c.recordHighYear})`,`RECORD LOW|${Y.temp(L.c.recordLow)} (${L.c.recordLowYear})`],t,o,H>=0?"#f2b45a":"#7fb2f0",{pin:n.coarse})}}function Xo(e,t,o,n,{rows:s,tf:d,now:v}){if(!s?.length)return;let g=4,y=22,w=14,i=18,c={x:g,y:w,w:t-g-y,h:o-w-i};if(c.w<30)return;let M=s.length,f=Math.max(2,c.w/M-2),l=Math.max(5.6,Math.ceil(Math.max(...s.map(p=>p.kp))+.8)),h=p=>c.y+c.h-N(p,0,l)/l*c.h;Ie(e,c,[3,5,7].filter(p=>p<=l).map(p=>({v:p,y:h(p)})),String),e.save(),e.strokeStyle=V(R.serious,.5),e.setLineDash([4,3]),e.lineWidth=1,e.beginPath(),e.moveTo(c.x,h(5)),e.lineTo(c.x+c.w,h(5)),e.stroke(),e.setLineDash([]),e.font=we,e.fillStyle=V(R.serious,.8),e.textAlign="left",e.textBaseline="bottom",Le(e,"STORM",c.x+3,h(5)-2),e.restore(),s.forEach((p,b)=>{let T=p.kp<3?j[0]:p.kp<5?R.good:p.kp<6?R.warn:p.kp<7?R.serious:R.crit,$=c.x+b*c.w/M;Ke(e,$,h(Math.min(p.kp,l)),f,c.y+c.h,V(T,p.observed==="observed"?.9:.55))}),e.save(),e.font=ke,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let a="",u=e.measureText("WED").width+8,m=-1e9;if(s.forEach((p,b)=>{let T=d.isoDate(p.t);if(T===a)return;a=T;let $=c.x+b*c.w/M+f/2;$<c.x+10||$>c.x+c.w-10||$-m<u||(e.fillText(d.weekday(p.t).toUpperCase(),$,o-i+4),m=$)}),e.restore(),Se(e,c.x+2,2,"planetary K index"),n&&n.x>c.x&&n.x<c.x+c.w){let p=N(Math.floor((n.x-c.x)/c.w*M),0,M-1),b=s[p];ot(e,c.x+p*c.w/M+f/2,n.y,[`${d.weekday(b.t)} ${d.hm(b.t)}|`,`Kp|${b.kp.toFixed(2)}`,`STATUS|${(b.observed||"predicted").toUpperCase()}`],t,o,j[3],{pin:n.coarse})}}var _t=(e,t,o)=>o>=6&&o<22;function re(e,t,o,n,s){return e==null?.5:e>=o&&e<=n?1:e<o?t>=o?1:N((e-t)/(o-t),0,1):s<=n?1:N((s-e)/(s-n),0,1)}var Bt={walk:{label:"WALK",icon:"\u{1F6B6}",color:"#3fd0d8",hours:_t,score(e){return[["temperature",re(e.feels??e.temp,30,50,75,95),.3],["dry",1-N((e.pop??0)/100,0,1)*.9,.24],["wind",re(e.wind,-1,0,12,30),.12],["humidity",re(e.dew,-20,20,60,76),.1],["UV",re(e.uv,-1,0,5,11),.07],["air quality",re(e.air?.aqi,-1,0,50,160),.07],["daylight",e.isDay?1:.5,.1]]}},bike:{label:"BIKE",icon:"\u{1F6B2}",color:"#8fdc6a",hours:_t,score(e){return[["temperature",re(e.feels??e.temp,25,58,78,98),.26],["dry",1-N((e.pop??0)/100,0,1),.22],["wind",re(e.gust??e.wind,-1,0,8,24),.24],["visibility",re(e.vis,0,8e3,1/0,1/0),.08],["UV",re(e.uv,-1,0,5,11),.05],["air quality",re(e.air?.aqi,-1,0,50,150),.05],["daylight",e.isDay?1:.35,.1]]}},grill:{label:"GRILL",icon:"\u{1F525}",color:"#f2b45a",hours:_t,score(e){return[["dry",1-N((e.pop??0)/100,0,1)*1,.34],["temperature",re(e.temp,35,62,88,104),.24],["wind",re(e.wind,-1,0,10,22),.24],["daylight or dusk",e.isDay?1:.55,.1],["humidity",re(e.dew,-20,20,64,78),.08]]}},stargaze:{label:"STARGAZE",icon:"\u2726",color:"#b39dfa",hours:e=>!e.isDay,score(e,t){return[["darkness",e.isDay?0:1,.26],["clear sky",1-N((e.cloud??0)/100,0,1),.32],["no moon",1-N(t?.moonFraction??.5,0,1)*(t?.moonUp?1:.15),.18],["transparency",re(e.vis,0,2e4,1/0,1/0),.1],["low humidity",re(e.rh,-1,0,65,100),.08],["calm",re(e.wind,-1,0,8,28),.06]]}},photo:{label:"PHOTO",icon:"\u25CE",color:"#f07aa6",hours:(e,t)=>!!e.isDay||t?.sunAltDeg!=null&&t.sunAltDeg>-8,score(e,t){let o=t?.sunAltDeg==null?.4:Math.exp(-Math.pow((t.sunAltDeg-3)/7,2)),n=1-Math.abs((e.cloud??50)/100-.45)*1.6;return[["golden light",N(o,0,1),.4],["sky texture",N(n,0,1),.26],["dry",1-N((e.pop??0)/100,0,1)*.7,.18],["clarity",re(e.vis,0,15e3,1/0,1/0),.16]]}},swim:{label:"SWIM",icon:"\u{1F3CA}",color:"#7fb2f0",hours:(e,t,o)=>!!e.isDay&&o>=7&&o<20,score(e){let t=[95,96,99].includes(Number(e.code));return[["temperature",re(e.feels??e.temp,65,80,95,105),.34],["dry",1-N((e.pop??0)/100,0,1),.18],["no thunder",t?0:1,.1],["sunshine",re(e.cloud,-1,0,40,100),.12],["wind",re(e.wind,-1,0,10,25),.12],["UV",re(e.uv,-1,2,7,11),.08],["air quality",re(e.air?.aqi,-1,0,50,150),.06]]}},openWindows:{label:"OPEN UP",icon:"\u{1FA9F}",color:"#5cd6bc",hours:_t,score(e){return[["comfortable air",re(e.temp,40,62,76,90),.34],["dry air",re(e.dew,-20,25,58,70),.24],["clean air",re(e.air?.aqi,-1,0,50,130),.22],["no rain",1-N((e.pop??0)/100,0,1),.12],["calm",re(e.wind,-1,0,14,34),.08]]}}},Wt=Object.keys(Bt),Ut=e=>Bt[e];function Gt(e,t,o){let n=Bt[e];if(!n||!t)return null;let s=n.score(t,o),d=0;for(let[,y,w]of s)d+=N(y,0,1)*w;let v=null,g=0;for(let[y,w,i]of s){let c=(1-N(w,0,1))*i;c>g&&(g=c,v=y)}return{score:Math.round(N(d,0,1)*100),limiter:g>.06?v:null,parts:s.map(([y,w,i])=>({name:y,value:N(w,0,1),weight:i}))}}function na(e,t){let o=e.fmt?.hourOfDay?e.fmt.hourOfDay(t):NaN;return Number.isFinite(o)?o:new Date(t).getHours()}function en(e,t,o=36){let n=Bt[e];if(!n)return[];let s=Date.now(),d=s+o*36e5;return t.hours.filter(v=>v.t>=s-18e5&&v.t<=d).map(v=>{let g=sa(t,v.t),y=n.hours?!!n.hours(v,g,na(t,v.t)):!0;return{t:v.t,eligible:y,...Gt(e,{...v,air:aa(t,v.t)},g)}})}function tn(e,t,{hours:o=36,at:n=90}={}){let d=en(e,t,o).filter(v=>v.eligible);return{great:d.filter(v=>v.score>=n).length,eligible:d.length}}function qt(e,t,{hours:o=36,limit:n=3,minScore:s=55}={}){let d=en(e,t,o);if(!d.length)return[];for(let w of d)w.eligible||(w.score=-1/0);let v=12,g=new Array(d.length).fill(!1),y=[];for(let w=0;w<n;w++){let i=-1;for(let a=0;a<d.length;a++)g[a]||d[a].score<s||(i<0||d[a].score>d[i].score)&&(i=a);if(i<0)break;let c=d[i].score,M=Math.max(s,c-v),f=i,l=i;for(;f-1>=0&&!g[f-1]&&d[f-1].score>=M;)f--;for(;l+1<d.length&&!g[l+1]&&d[l+1].score>=M;)l++;for(let a=f;a<=l;a++)g[a]=!0;let h=0;for(let a=f;a<=l;a++)h+=d[a].score;y.push({start:d[f].t,end:d[l].t+36e5,peakAt:d[i].t,peak:c,avg:Math.round(h/(l-f+1)),hours:l-f+1,limiter:d[i].limiter,parts:d[i].parts})}return y.sort((w,i)=>i.peak-w.peak||w.start-i.start)}function aa(e,t){if(!e.air?.length)return null;let o=null,n=1/0;for(let s of e.air){let d=Math.abs(s.t-t);d<n&&(n=d,o=s)}return n<36e5*2?o:null}function sa(e,t){let o=e.frame(t);return o?{sunAltDeg:o.sun.altDeg,moonFraction:o.moon.fraction,moonUp:o.moon.altDeg>0}:{}}function bt(e){let t=Date.now(),o=t+6*36e5,n=(e.min15?.length?e.min15:e.hours).filter(y=>y.t>=t-9e5&&y.t<=o);if(n.length<2)return null;let s=.002,d=(n[0].precip??0)>=s,v=null;for(let y of n)if((y.precip??0)>=s!==d){v=y;break}let g=n.reduce((y,w)=>(w.precip??0)>(y.precip??0)?w:y,n[0]);return{raining:d,changeAt:v?.t??null,minutes:v?Math.round((v.t-t)/6e4):null,peak:g.precip??0,peakAt:g.t,resolution:e.min15?.length?15:60,series:n.map(y=>({t:y.t,p:y.precip??0}))}}function on(e,t){return e?e.raining?e.minutes!=null?`Rain now \u2014 easing in about ${e.minutes} min`:"Rain now \u2014 no let-up in the next 6 hours":e.minutes!=null&&e.minutes<=240?`${e.peak>.08?"Heavy rain":e.peak>.02?"Rain":"Light rain"} starting in ${e.minutes} min (${t.hm(e.changeAt)})`:null:null}var Vt=e=>e<0?0:e>1?1:e,ge=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function nn(e,t,o={},n={}){if(!t)return null;let s=ge(t.temperature_2m),d=String(o.temperature_2m||"").includes("F"),v=ge(t.wind_speed_10m),g=/mp\/?h|mph/i.test(String(o.wind_speed_10m||"")),y=ge(t.precipitation),w=/inch/i.test(String(o.precipitation||""));return{name:e,tempRaw:s,tempC:s===null?null:d?(s-32)/1.8:s,windKmh:v===null?null:g?v*1.609344:v,precipMm:y===null?null:w?y*25.4:y,cloudPct:ge(t.cloud_cover),night:t.is_day===0,...n}}function Mt(e){let t=ge(e?.tempC);if(t===null)return null;let o=Vt(1-Math.abs(t-21)/18),n=Vt(1-(ge(e?.precipMm)??0)/2),s=Vt(1-(ge(e?.cloudPct)??0)/100*.6),d=Vt(1-Math.max(0,(ge(e?.windKmh)??0)-20)/40);return Math.round(100*(.4*o+.3*n+.2*s+.1*d))}function jt(e){let t=ge(e?.precipMm)??0,o=ge(e?.cloudPct),n=ge(e?.windKmh)??0;return t>=.5?"raining":t>0?"drizzling":n>=20+40/2?"blowing hard":o===null?null:o<=15?"clear":o<=45?"some cloud":o<=80?"cloudy":"overcast"}function ia(e,t){let o=Mt(e),n=Mt(t);if(n===null)return null;let s=ge(t.tempC)!==null&&ge(e?.tempC)!==null?Math.round(t.tempC-e.tempC):null,d=ge(t.tempRaw)!==null&&ge(e?.tempRaw)!==null?Math.round(t.tempRaw-e.tempRaw):null;return{name:t.name,score:n,deltaScore:o===null?null:n-o,deltaC:s,deltaShown:d===null?s:d,better:o!==null&&n>o,headline:jt(t),tempC:ge(t.tempC),localHour:ge(t.localHour),night:t.night===!0}}function an(e,t){let o=(Array.isArray(t)?t:[]).map(n=>ia(e,n)).filter(Boolean);return o.sort((n,s)=>s.score-n.score||(s.deltaC??0)-(n.deltaC??0)||String(n.name).localeCompare(String(s.name))),o}function fo(e){if(!e)return"";let t=[],o=e.deltaShown??e.deltaC;return o!==null&&o!==0?t.push(`${Math.abs(o)}\xB0 ${o>0?"warmer":"colder"}`):o===0&&t.push("same temperature"),e.headline&&t.push(e.headline),e.night&&e.localHour!==null&&t.push(`${e.localHour}:00 there`),t.join(", ")}function sn(e,t){if(!t.length)return"Nowhere to compare against right now.";let o=t.filter(d=>d.better);if(!o.length)return`Nowhere on the list beats ${e} right now.`;let n=o[0],s=o.length-1;return`${n.name} is better than ${e} right now \u2014 ${fo(n)}.`+(s>0?` So ${s===1?"is one other":`are ${s} others`}.`:"")}var ra="../countdown/stats.json",rn=[{place:"San Francisco, California",lat:37.7749,lon:-122.4194},{place:"Vancouver, Canada",lat:49.2497,lon:-123.1193},{place:"Grants Pass, Oregon",lat:42.4393,lon:-123.3307}],la=600*1e3;function ln(e){e.className="panel elsewhere",e.innerHTML=`
    <div class="hd">ELSEWHERE<span class="rule"></span><span class="val" id="ew-count">\u2014</span></div>
    <div class="body">
      <div class="ew-list" id="ew-list"><div class="ew-empty">Looking\u2026</div></div>
      <p class="ew-say" id="ew-say"></p>
    </div>`;let t=M=>e.querySelector(`#${M}`),o=null,n=0,s=[],d="",v=!1;async function g(){if(o)return o;try{let M=await(await fetch(new URL(ra,location.href),{cache:"no-cache"})).json(),f=Array.isArray(M?.trips)?M.trips:[],l=new Date,h=`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}-${String(l.getDate()).padStart(2,"0")}`,a=m=>typeof m.date!="string"||(m.date.length===7?`${m.date}-01`:m.date)<=h,u=new Set;o=f.filter(m=>m&&typeof m.lat=="number"&&typeof m.lon=="number"&&a(m)&&typeof m.place=="string"&&!u.has(m.place)&&u.add(m.place)),o.length||(console.warn("ELSEWHERE: trip list had no usable coordinates; using the fallback"),o=rn)}catch(M){console.warn("ELSEWHERE: could not read the trip list, using the fallback \u2014",M.message),o=rn}return o}async function y(M){try{let l=(await ce.bundle(M.lat,M.lon))?.forecast?.data;if(!l?.current)return null;let h=Number(String(l.current.time||"").slice(11,13));return nn(M.place,l.current,l.current_units,{localHour:Number.isFinite(h)?h:null})}catch{return null}}async function w(){let M=r.loc;if(!M||v)return;let f=`${M.lat?.toFixed(2)},${M.lon?.toFixed(2)}`;if(!(f===d&&Date.now()-n<la)){v=!0;try{let l=await g(),h=await y({place:M.name||"here",lat:M.lat,lon:M.lon});if(!h)return;let a=(await Promise.all(l.map(y))).filter(Boolean);s=an(h,a),d=f,n=Date.now(),i(h),c(h)}finally{v=!1}}}function i(M){let f=Mt(M),l=s.filter(u=>u.better);if(t("ew-count").textContent=s.length?l.length?`${l.length} better`:"none better":"\u2014",!s.length){t("ew-list").innerHTML='<div class="ew-empty">No places to compare.</div>',t("ew-say").textContent="";return}let h=u=>`
      <div class="ew-row${u.better?" is-better":""}">
        <span class="ew-name">${oe(u.name)}</span>
        <span class="ew-what">${oe(fo(u))}</span>
      </div>`,a=`
      <div class="ew-here">
        <span class="ew-name">${oe(M.name)}</span>
        <span class="ew-what">here \xB7 ${oe(jt(M)||"")}${Number.isFinite(f)?` \xB7 ${f}/100`:""}</span>
      </div>`;t("ew-list").innerHTML=l.map(h).join("")+a+s.filter(u=>!u.better).map(h).join(""),t("ew-say").textContent=sn(M.name,s)}async function c(M){try{let f={here:M.name,hereSky:jt(M),hereScore:Mt(M),rows:s.map(a=>({name:a.name,delta:a.deltaShown??a.deltaC,sky:a.headline,better:a.better,night:a.night}))},l=btoa(unescape(encodeURIComponent(JSON.stringify(f)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),h=await ce.elsewhere(l);h?.text&&d&&(t("ew-say").textContent=h.text)}catch{}}return{update(){w()},onHide(){}}}function dn(e){e.className="view deck active",e.innerHTML=`
    <div class="panel hero">
      <div class="hd">CURRENT<span class="rule"></span><span class="val" id="d-obs">\u2014</span></div>
      <div class="body">
        <div class="hero-top">
          <div>
            <div class="hero-temp chroma num" id="d-temp">--<sup>\xB0F</sup></div>
            <div class="hero-cond neon" id="d-cond">\u2014</div>
            <div class="hero-feels">feels like <b id="d-feels">--</b> \xB7 dew point <b id="d-dew">--</b></div>
            <div class="hero-obs" id="d-obsline"></div>
          </div>
          <div class="hero-glyph" id="d-glyph">\u25CC</div>
        </div>
        <div class="hero-range">
          <div class="stat"><div class="c">today high</div><div class="v" id="d-hi">--</div></div>
          <div class="stat"><div class="c">today low</div><div class="v" id="d-lo">--</div></div>
          <div class="stat"><div class="c">vs normal</div><div class="v" id="d-anom">--</div></div>
        </div>
        <div class="hero-spark"><canvas class="chart" id="d-spark"></canvas></div>
        <div class="hero-sun">
          <div class="stat"><div class="c">sunrise</div><div class="v" id="d-sunrise" style="font-size:.95rem">--</div></div>
          <div class="stat"><div class="c">sunset</div><div class="v" id="d-sunset" style="font-size:.95rem">--</div></div>
          <div class="stat"><div class="c">daylight</div><div class="v" id="d-daylight" style="font-size:.95rem">--</div></div>
        </div>
      </div>
    </div>

    <div class="panel meteo bare">
      <canvas class="chart fill" id="d-meteo"></canvas>
    </div>

    <div class="side">
      <div class="panel" id="d-alertPanel" style="--ac:var(--rd); display:none">
        <div class="hd">ACTIVE ALERTS<span class="rule"></span><span class="val" id="d-alertN">0</span></div>
        <div class="body" id="d-alerts"></div>
      </div>

      <div class="panel">
        <div class="hd" style="--ac:var(--ice)">NOWCAST<span class="rule"></span><span class="val" id="d-ncres">\u2014</span></div>
        <div class="body nowcast">
          <div class="nowcast-line" id="d-ncline">\u2014</div>
          <div class="nowcast-bars"><canvas class="chart" id="d-nc"></canvas></div>
          <div class="nowcast-scale"><span>NOW</span><span>+2h</span><span>+4h</span><span>+6h</span></div>
        </div>
      </div>

      <!--
        Above SUN & MOON deliberately. The column scrolls, and at 900px only
        three panels are above the fold \u2014 sun and moon are also the whole top
        half of the SKY view, while this is the only place ELSEWHERE appears.
      -->
      <div id="d-elsewhere"></div>

      <div class="panel grow">
        <div class="hd" style="--ac:var(--vi)">SUN &amp; MOON<span class="rule"></span><span class="val" id="d-moonname">\u2014</span></div>
        <div class="body sunmoon-body"><canvas id="d-moondisc"></canvas><div id="d-sunmoon" style="flex:1;min-width:0"></div></div>
      </div>
    </div>

    <div class="panel gauge">
      <div class="hd">INSTRUMENTS<span class="rule"></span><span class="val" id="d-instnote">\u2014</span></div>
      <div class="body">
        <div class="gauge-cell"><canvas class="chart" id="g-wind"></canvas><div class="gauge-note" id="n-wind"></div></div>
        <div class="gauge-cell"><canvas class="chart" id="g-hum"></canvas><div class="gauge-note" id="n-hum"></div></div>
        <div class="gauge-cell"><canvas class="chart" id="g-pres"></canvas><div class="gauge-note" id="n-pres"></div></div>
        <div class="gauge-cell"><canvas class="chart" id="g-uv"></canvas><div class="gauge-note" id="n-uv"></div></div>
        <div class="gauge-cell"><canvas class="chart" id="g-aqi"></canvas><div class="gauge-note" id="n-aqi"></div></div>
        <div class="gauge-cell"><canvas class="chart" id="g-vis"></canvas><div class="gauge-note" id="n-vis"></div></div>
      </div>
    </div>

    <div class="panel act">
      <div class="hd" style="--ac:var(--lm)">ACTIVITY WINDOWS<span class="rule"></span><span class="val">NEXT 36H</span></div>
      <div class="body" id="d-act"></div>
    </div>

    <div class="panel tenday">
      <div class="hd" style="--ac:var(--am)">16-DAY OUTLOOK<span class="rule"></span><span class="val" id="d-tdnote">\u2014</span></div>
      <div class="body"><div class="tenday-grid" id="d-tenday"></div></div>
    </div>
  `;let t=a=>e.querySelector("#"+a),o=ln(t("d-elsewhere")),n=de(t("d-meteo"),(a,u,m,p)=>{let b=Date.now();zt(a,u,m,p,{hours:r.hours,days:r.days,tf:r.fmt,span:{lo:r.cursor-12*36e5,hi:r.cursor+36*36e5},cursor:r.cursor,now:b,panels:["temp","pop","wind"]})},{onPick:({x:a,w:u})=>{let m=r.cursor-432e5,p=r.cursor+36*36e5,b=u-34;r.playing=!1,r.scrubTo(m+(a-4)/b*(p-m))}}),s=de(t("d-spark"),(a,u,m)=>{let p=r.hours.filter(T=>T.t>=r.cursor-36e5&&T.t<=r.cursor+864e5);if(p.length<2)return;let b=Go(a,{x:0,y:4,w:u,h:m-14},p.map(T=>T.temp),{color:j[0],glow:9});a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="center",a.textBaseline="bottom";for(let T=0;T<p.length;T+=6)He(a,r.fmt.hour(p[T].t).replace(/\s/g,""),T/(p.length-1)*u,m,0,u);a.restore(),b?.length&&(a.save(),a.fillStyle=ye,a.shadowColor=j[0],a.shadowBlur=5,a.beginPath(),a.arc(b[1]?.[0]??b[0][0],b[1]?.[1]??b[0][1],3,0,Math.PI*2),a.fill(),a.restore())}),d=de(t("d-moondisc"),(a,u,m)=>{let p=r.frame();p&&Ft(a,u/2,m/2,Math.max(10,Math.min(u,m)/2-3),p.moon.phase,p.moon.fraction)}),v=de(t("d-nc"),(a,u,m)=>{let p=bt(r);if(!p?.series?.length)return;let b=Math.max(...p.series.map(k=>k.p),.02),T=p.series.length,$=Math.max(1,u/T-.6);p.series.forEach((k,L)=>{let H=L*u/T,A=k.p>0?Math.max(1.5,k.p/b*m):0;A&&Ke(a,H,m-A,$,m,V(k.p>.08?R.crit:k.p>.02?j[0]:j[4],.9),2)}),a.save(),a.strokeStyle="rgba(255,255,255,.10)",a.beginPath(),a.moveTo(0,m-.5),a.lineTo(u,m-.5),a.stroke(),a.restore()}),g=[["g-wind",(a,u,m)=>{let p=r.frame(),b=Math.min(u,m)/2-16;qo(a,u/2,m/2-4,Math.max(14,b),{dir:p?.windDir,speed:p?.wind,gust:p?.gust,color:j[3]})}],["g-hum",(a,u,m)=>{let p=r.frame(),b=Math.min(u,m)/2-18;Ye(a,u/2,m/2-6,Math.max(14,b),{value:p?.rh,min:0,max:100,color:j[4],label:"humidity",unit:"%",sub:p?je(p.dew).name:""})}],["g-pres",(a,u,m)=>{let p=r.frame(),b=Math.min(u,m)/2-18,T=p?.pressure?p.pressure*.029529983:null;Ye(a,u/2,m/2-6,Math.max(14,b),{value:T,min:28.5,max:31,color:j[3],label:"pressure",unit:"inHg",decimals:2,sub:y()})}],["g-uv",(a,u,m)=>{let p=r.frame(),b=Math.min(u,m)/2-18;Ye(a,u/2,m/2-6,Math.max(14,b),{value:p?.uv,min:0,max:12,color:Ve(p?.uv).color,label:"uv index",unit:"index",decimals:1,sub:Ve(p?.uv).name,bands:[{from:0,to:3,color:R.good},{from:3,to:6,color:R.warn},{from:6,to:8,color:R.serious},{from:8,to:11,color:R.crit},{from:11,to:12,color:j[3]}]})}],["g-aqi",(a,u,m)=>{let b=r.frame()?.air?.aqi??r.airNow?.aqi,T=Be(b),$=Math.min(u,m)/2-18;Ye(a,u/2,m/2-6,Math.max(14,$),{value:b,min:0,max:200,color:T.color,label:"air quality",unit:"US AQI",sub:T.name.length>12?"SENSITIVE":T.name,bands:[{from:0,to:50,color:R.good},{from:50,to:100,color:R.warn},{from:100,to:150,color:R.serious},{from:150,to:200,color:R.crit}]})}],["g-vis",(a,u,m)=>{let p=r.frame(),b=p?.vis!=null?p.vis/1609.344:null,T=Math.min(u,m)/2-18;Ye(a,u/2,m/2-6,Math.max(14,T),{value:b==null?null:Math.min(b,10),min:0,max:10,color:j[0],label:"visibility",unit:"miles",decimals:1,sub:b==null?"":b>=9?"CLEAR":b>=3?"HAZY":b>=1?"POOR":"FOG"})}]].map(([a,u])=>de(t(a),u));function y(){let a=r.cursor,u=r.hours.find(b=>b.t>=a-3*36e5),m=r.hours.find(b=>b.t>=a);if(!u?.pressure||!m?.pressure)return"";let p=(m.pressure-u.pressure)*.029529983;return Math.abs(p)<.02?"STEADY":p>0?`RISING ${p.toFixed(2)}`:`FALLING ${Math.abs(p).toFixed(2)}`}function w(){let a=r.frame();if(!a)return;let u=r.fmt;t("d-temp").innerHTML=`${a.temp==null?"--":Math.round(a.temp)}<sup>\xB0F</sup>`,t("d-cond").textContent=a.wx.label,t("d-glyph").textContent=oo(Math.round(a.code??0),a.isDay>.5),t("d-feels").textContent=Y.temp(a.feels),t("d-dew").textContent=Y.temp(a.dew),t("d-obs").textContent=r.atNow?`LIVE \xB7 ${to(r.lastFetch)}`:`PROJECTED \xB7 ${u.hm(r.cursor)}`;let m=r.observed,p=t("d-obsline");if(r.atNow&&m?.tempF!=null){let P=a.temp!=null?a.temp-m.tempF:null;p.innerHTML=`observed <b>${Math.round(m.tempF)}\xB0</b><span> \xB7 ${oe(m.name||m.station)} ${m.distanceMi} mi \xB7 ${to(Date.parse(m.time))}</span>`+(P!=null&&Math.abs(P)>=1.5?`<em> \xB7 model runs ${Y.signed(P,0)}\xB0</em>`:""),p.style.display=""}else p.style.display="none";let b=a.day;t("d-hi").textContent=Y.temp(b?.tmax),t("d-lo").textContent=Y.temp(b?.tmin);let T=t("d-anom"),$=r.climate?.doy?.[h(r.cursor)];if($&&b?.tmax!=null){let P=b.tmax-$.normalHigh;T.textContent=`${Y.signed(P,1)}\xB0`,T.style.color=Math.abs(P)<2?pe:P>0?"#f2b45a":"#7fb2f0"}else T.textContent="--",T.style.color="";let k=r.sunTimesFor();t("d-sunrise").textContent=u.hm(k.sunrise),t("d-sunset").textContent=u.hm(k.sunset),t("d-daylight").textContent=b?.daylight?rt(b.daylight):"--";let L=r.alerts,H=t("d-alertPanel");H.style.display=L.length?"":"none",t("d-alertN").textContent=String(L.length),t("d-alerts").innerHTML=L.slice(0,4).map(P=>`
      <div class="alert-item" style="--ac:${yt(P.event,P.severity)}">
        <b>${oe(P.event||"Alert")}</b>
        <span>until ${u.weekday(P.expires||P.ends)} ${u.hm(P.expires||P.ends)}</span>
      </div>`).join("");let A=bt(r),C=on(A,u),O=t("d-ncline");if(C)O.textContent=C,O.className="nowcast-line wet";else{let P=r.hours.find(q=>q.t>Date.now()&&(q.pop??0)>=40);O.textContent=P?`Dry for 6+ hours. Next real chance ${u.weekday(P.t)} ${u.hm(P.t)} (${Math.round(P.pop)}%).`:"Dry. No meaningful precipitation in the forecast window.",O.className="nowcast-line"}t("d-ncres").textContent=A?`${A.resolution}-MIN`:"\u2014";let E=a.moon,D=r.moonTimesFor();t("d-moonname").textContent=`${Math.round(E.fraction*100)}% LIT`,t("d-sunmoon").innerHTML=`
      <dl style="margin:0">
        ${f("Sun altitude",`${a.sun.altDeg.toFixed(1)}\xB0 ${me(a.sun.compass)}`)}
        ${f("Golden hour",`${u.hm(k.goldenHour)} \u2013 ${u.hm(k.sunset)}`)}
        ${f("Blue hour",`${u.hm(k.sunset)} \u2013 ${u.hm(k.dusk)}`)}
        ${f("Astro dark",isNaN(+k.night)?"none tonight":u.hm(k.night))}
        ${f("Moon",`${l(E.phase)}`)}
        ${f("Moon alt",`${E.altDeg.toFixed(1)}\xB0 ${me(E.compass)}`)}
        ${f("Moonrise",D.rise?u.hm(D.rise):"\u2014")}
        ${f("Moonset",D.set?u.hm(D.set):"\u2014")}
      </dl>`;let z=Dt(a.wind);t("n-wind").textContent=`${z.name} \xB7 from ${me(a.windDir)}`,t("n-hum").textContent=je(a.dew).note,t("n-pres").textContent=a.pressure?`${Math.round(a.pressure)} hPa`:"";let U=Lt(a.uv,r.settings.skinType);t("n-uv").textContent=U==null?"no burn risk":U>180?"burn risk negligible":`burn in ~${U} min`;let W=a.air?.aqi??r.airNow?.aqi;t("n-aqi").textContent=a.air?.pm25!=null?`PM2.5 ${a.air.pm25.toFixed(1)} \xB5g/m\xB3`:W!=null?"":"no data",t("n-vis").textContent=a.vis!=null?`${(a.vis/1609.344).toFixed(1)} mi`:"",t("d-instnote").textContent=r.atNow?"LIVE":u.hm(r.cursor),c(),M(),d.render();for(let P of g)P.render();n.render(),s.render(),v.render()}let i=null;function c(){let a=r.fmt,u=b=>`${a.weekday(b)} ${a.hour(b)}`,m=(b,T)=>a.isoDate(b)===a.isoDate(T)?`${a.weekday(b)} ${a.hour(b)}\u2013${a.hour(T)}`:`${u(b)} \u2013 ${u(T)}`,p=Wt.map(b=>{let T=Ut(b),$=qt(b,r,{hours:36,limit:1,minScore:50})[0],k=tn(b,r,{hours:36,at:90});return{k:b,meta:T,w:$,g:k}}).sort((b,T)=>T.g.great-b.g.great||(T.w?.peak??0)-(b.w?.peak??0));t("d-act").innerHTML=p.map(({k:b,meta:T,w:$,g:k})=>{let L=k.great,H=k.eligible?L/k.eligible:0,A=L>0?R.good:($?.peak??0)>=60?R.warn:R.serious,C=$?`<b class="act-best">Best ${u($.peakAt)}</b><span class="act-good">Good ${m($.start,$.end)}</span>`+(L===0?`<span class="act-note">Best hour scores ${$.peak}/100</span>`:"")+($.limiter?`<span class="act-note">Held back by ${$.limiter}</span>`:""):'<span class="act-note">No good time in the next 36 hours</span>',O=i===b&&$,E=$?$.parts.map(D=>{let z=Math.round((1-D.value)*D.weight*100);return`<span class="act-factor"><span class="act-fname">${D.name}</span><span class="meter act-fbar" style="--ac:${z===0?R.good:D.value>=.6?R.warn:R.serious}"><i style="width:${Math.round(D.value*100)}%"></i></span><span class="act-fpts">${z?"\u2212"+z:"full marks"}</span></span>`}).join(""):"";return`
        <button type="button" class="act-row" data-act="${b}" aria-expanded="${O?"true":"false"}"
                aria-controls="act-why-${b}"${$?"":" disabled"}>
          <span class="act-icon" style="color:${T.color}">${T.icon}</span>
          <span class="act-text">
            <span class="act-name">${T.label}</span>
            <span class="act-when">${C}</span>
            <span class="meter act-bar" style="--ac:${A}"><i style="width:${Math.round(H*100)}%"></i></span>
          </span>
          <span class="act-score" style="color:${A}">${L}<small class="act-unit">great hours</small></span>
        </button>
        <div class="act-why" id="act-why-${b}"${O?"":" hidden"}>
          <span class="act-whyhd">Why the best hour (${$?u($.peakAt):""}) scores ${$?.peak??0}</span>${E}
        </div>`}).join("")}t("d-act").addEventListener("click",a=>{let u=a.target.closest(".act-row");!u||u.disabled||(i=i===u.dataset.act?null:u.dataset.act,c(),t("d-act").querySelector(`.act-row[data-act="${u.dataset.act}"]`)?.focus())}),t("d-act").addEventListener("keydown",a=>{if(a.key!=="Escape"||!i)return;let u=i;i=null,c(),t("d-act").querySelector(`.act-row[data-act="${u}"]`)?.focus()});function M(){let a=r.fmt,u=a.isoDate(Date.now()),m=r.days.filter(k=>k.tmax!=null&&a.isoDate(k.t)>=u);if(!m.length)return;let p=Math.min(...m.map(k=>k.tmin)),b=Math.max(...m.map(k=>k.tmax)),T=a.isoDate(Date.now()),$=a.isoDate(r.cursor);t("d-tenday").innerHTML=m.map(k=>{let L=a.isoDate(k.t),H=(b-k.tmax)/(b-p||1)*100,A=(k.tmin-p)/(b-p||1)*100,C=`linear-gradient(to top, ${Ae(k.tmin)}, ${Ae(k.tmax)})`;return`
        <div class="tenday-col ${L===T?"today":""} ${L===$?"cursor":""}" data-t="${k.t}">
          <div class="td-day">${L===T?"TODAY":a.weekday(k.t)}</div>
          <div class="td-date">${a.monthDay(k.t)}</div>
          <div class="td-glyph" title="${et(Math.round(k.code)).long}">${oo(Math.round(k.code),!0)}</div>
          <div class="td-hi">${Math.round(k.tmax)}\xB0</div>
          <div class="td-bar"><i style="top:${H}%;bottom:${A}%;background:${C};box-shadow:0 0 8px ${Ae(k.tmax)}66"></i></div>
          <div class="td-lo">${Math.round(k.tmin)}\xB0</div>
          <div class="td-pop">${(k.pop??0)>=10?`${Math.round(k.pop)}%`:""}</div>
        </div>`}).join(""),t("d-tdnote").textContent=`${m.length} DAYS AHEAD`,t("d-tenday").querySelectorAll(".tenday-col").forEach(k=>{k.addEventListener("click",()=>{r.playing=!1,r.scrubTo(+k.dataset.t+13*36e5)})})}let f=(a,u)=>`<div class="kv"><dt>${a}</dt><dd>${u}</dd></div>`,l=a=>["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous","Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"][Math.round((a%1+1)%1*8)%8],h=a=>{let u=r.fmt.isoDate(a),[,m,p]=u.split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][m-1]+p-1};return{update(){w(),o.update()},onHide(){o.onHide()}}}var ht="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas",Yt="grayscale(1) brightness(1.18) contrast(1.05) sepia(.6) hue-rotate(170deg) saturate(1.3)",xt="grayscale(1) brightness(1.9) contrast(1.1) sepia(.4) hue-rotate(170deg) saturate(.8)";var be={lonToWorld:(e,t)=>(e+180)/360*Math.pow(2,t)*256,latToWorld:(e,t)=>{let o=Math.sin(Math.max(-85.05,Math.min(85.05,e))*Math.PI/180);return(.5-Math.log((1+o)/(1-o))/(4*Math.PI))*Math.pow(2,t)*256},worldToLon:(e,t)=>e/(Math.pow(2,t)*256)*360-180,worldToLat:(e,t)=>{let o=Math.PI-2*Math.PI*e/(Math.pow(2,t)*256);return 180/Math.PI*Math.atan(.5*(Math.exp(o)-Math.exp(-o)))}},at=new Map,Kt=0,da=[1500,4e3];function un(e,t,o){let n=new Image;t.img=n,t.state="loading",Kt++,n.crossOrigin="anonymous",n.onload=()=>{t.state="ok",Kt--,o?.()},n.onerror=()=>{Kt--;let s=da[t.tries++];if(s===void 0){t.state="err";return}setTimeout(()=>{at.get(e)===t&&un(e,t,o)},s)},n.src=e}function cn(e,t){let o=at.get(e);if(o)return o.state==="ok"?o.img:null;if(Kt>24)return null;let n={img:null,state:"loading",tries:0};if(at.set(e,n),un(e,n,t),at.size>600){let s=Math.floor(150);for(let d of at.keys()){if(s--<=0)break;at.delete(d)}}return null}var ca=10,ft=class{constructor(t,{center:o=[0,0],zoom:n=7,minZoom:s=2,maxZoom:d=12,onMove:v,onTap:g}={}){this.canvas=t,this.ctx=t.getContext("2d"),this.lat=o[0],this.lon=o[1],this.zoom=n,this.minZoom=s,this.maxZoom=d,this.onMove=v,this.onTap=g,this.layers=[],this.overlays=[],this.dirty=!0,this.w=0,this.h=0,this._raf=null,this._bind(),this._ro=new ResizeObserver(()=>this.resize()),this._ro.observe(t),this.resize()}resize(){let t=Math.min(window.devicePixelRatio||1,2),o=this.canvas.clientWidth,n=this.canvas.clientHeight;!o||!n||(this.canvas.width=Math.round(o*t),this.canvas.height=Math.round(n*t),this.ctx.setTransform(t,0,0,t,0,0),this.w=o,this.h=n,this.invalidate())}invalidate(){this._raf||(this._raf=requestAnimationFrame(()=>{this._raf=null,this.render()}))}setView(t,o,n){this.lat=t,this.lon=o,n!=null&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n))),this.invalidate(),this.onMove?.(this)}project(t,o){let n=this.zoom;return[be.lonToWorld(o,n)-be.lonToWorld(this.lon,n)+this.w/2,be.latToWorld(t,n)-be.latToWorld(this.lat,n)+this.h/2]}unproject(t,o){let n=this.zoom;return[be.worldToLat(be.latToWorld(this.lat,n)+o-this.h/2,n),be.worldToLon(be.lonToWorld(this.lon,n)+t-this.w/2,n)]}_placeAt(t,o,n,s){let d=this.zoom;this.lon=be.worldToLon(be.lonToWorld(o,d)+this.w/2-n,d),this.lat=Math.max(-85,Math.min(85,be.worldToLat(be.latToWorld(t,d)+this.h/2-s,d)))}_zoomAbout(t,o,n){let[s,d]=this.unproject(t,o);this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n)),this._placeAt(s,d,t,o)}_bind(){let t=this.canvas,o=new Map,n=null,s=null,d=w=>({x:w.clientX-s.left,y:w.clientY-s.top}),v=()=>{let w=[...o.values()];return{n:w.length,x:w.reduce((i,c)=>i+c.x,0)/w.length,y:w.reduce((i,c)=>i+c.y,0)/w.length,span:w.length<2?0:Math.hypot(w[0].x-w[1].x,w[0].y-w[1].y)}},g=()=>{if(!o.size){n=null;return}let w=v(),[i,c]=this.unproject(w.x,w.y);n={lat:i,lon:c,span:w.span,zoom:this.zoom}};t.addEventListener("pointerdown",w=>{if(o.size>=2)return;s=t.getBoundingClientRect();let i=d(w);o.set(w.pointerId,{...i,x0:i.x,y0:i.y});try{t.setPointerCapture(w.pointerId)}catch{}g(),t.style.cursor="grabbing"}),t.addEventListener("pointermove",w=>{if(!n||!o.has(w.pointerId))return;let i=o.get(w.pointerId);o.set(w.pointerId,{...d(w),x0:i.x0,y0:i.y0});let c=v();c.n>1&&n.span>20&&c.span>8&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n.zoom+Math.log2(c.span/n.span)))),this._placeAt(n.lat,n.lon,c.x,c.y),this.invalidate(),this.onMove?.(this)});let y=w=>{let i=o.get(w.pointerId);if(o.delete(w.pointerId)){try{t.releasePointerCapture(w.pointerId)}catch{}this.onTap&&!o.size&&Math.hypot(i.x-i.x0,i.y-i.y0)<ca&&this.onTap({x:i.x,y:i.y},w),g(),o.size||(t.style.cursor="grab")}};t.addEventListener("pointerup",y),t.addEventListener("pointercancel",y),t.addEventListener("wheel",w=>{w.preventDefault();let i=t.getBoundingClientRect(),c=-w.deltaY*(w.deltaMode===1?.05:.0022);this._zoomAbout(w.clientX-i.left,w.clientY-i.top,this.zoom+c),this.invalidate(),this.onMove?.(this)},{passive:!1});for(let w of["gesturestart","gesturechange","gestureend"])t.addEventListener(w,i=>i.preventDefault());t.style.cursor="grab",t.style.touchAction="none"}_layerTiles(t,o,n,s){let{w:d,h:v}=this,g=Math.min(o,t.maxTileZoom??o),y=256*Math.pow(2,this.zoom-g),w=Math.pow(2,g),i=Math.floor(n/y),c=Math.floor((n+d)/y),M=Math.floor(s/y),f=Math.floor((s+v)/y),l=[];for(let h=M;h<=f;h++)if(!(h<0||h>=w))for(let a=i;a<=c;a++){let u=(a%w+w)%w,m=t.url(g,u,h);m&&l.push({tx:a,ty:h,url:m})}return{size:y,tiles:l}}tilesSettled(t,o){let n=this.layers.find(w=>w.name===t);if(!n||n.enabled===!1||n.opacity===0||!this.w||!this.h)return!0;let s=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),d=be.lonToWorld(this.lon,this.zoom)-this.w/2,v=be.latToWorld(this.lat,this.zoom)-this.h/2,{tiles:g}=this._layerTiles(o?{...n,url:o}:n,s,d,v),y=!0;for(let w of g){o&&cn(w.url,()=>this.invalidate());let i=at.get(w.url)?.state;i!=="ok"&&i!=="err"&&(y=!1)}return y}render(){let{ctx:t,w:o,h:n}=this;if(!o||!n)return;t.clearRect(0,0,o,n),t.fillStyle="#0f1826",t.fillRect(0,0,o,n);let s=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),d=be.lonToWorld(this.lon,this.zoom)-o/2,v=be.latToWorld(this.lat,this.zoom)-n/2,g=()=>this.invalidate();for(let y of this.layers){if(y.enabled===!1||y.opacity===0)continue;let{size:w,tiles:i}=this._layerTiles(y,s,d,v);t.save(),t.globalAlpha=y.opacity??1,y.filter&&(t.filter=y.filter),y.blend&&(t.globalCompositeOperation=y.blend);let c=.5;for(let{tx:M,ty:f,url:l}of i){let h=cn(l,g);h&&t.drawImage(h,Math.round(M*w-d)-c,Math.round(f*w-v)-c,Math.ceil(w)+c*2,Math.ceil(w)+c*2)}t.restore()}for(let y of this.overlays){t.save();try{y(t,this)}catch(w){console.error("[map overlay]",w)}t.restore()}}destroy(){this._ro.disconnect()}};function fn(e,t,o,{stroke:n,fill:s,width:d=1.5,glow:v=8}){if(!o)return;let g=o.type==="Polygon"?[o.coordinates]:o.type==="MultiPolygon"?o.coordinates:null;if(g){e.beginPath();for(let y of g)for(let w of y)w.forEach(([i,c],M)=>{let[f,l]=t.project(c,i);M===0?e.moveTo(f,l):e.lineTo(f,l)}),e.closePath();s&&(e.fillStyle=s,e.fill("evenodd")),n&&(e.save(),v&&(e.shadowColor=n,e.shadowBlur=v/2),e.strokeStyle=n,e.lineWidth=d,e.stroke(),e.restore())}}function Zt(e,t,o,n="#f07aa6",s=null,d=0){e.save(),e.shadowColor=n,e.shadowBlur=7,e.strokeStyle=n,e.lineWidth=1.5;let v=7;e.beginPath(),e.arc(t,o,v,0,Math.PI*2),e.stroke(),e.beginPath();for(let[g,y]of[[-1,0],[1,0],[0,-1],[0,1]])e.moveTo(t+g*(v+2),o+y*(v+2)),e.lineTo(t+g*(v+7),o+y*(v+7));if(e.stroke(),e.fillStyle=n,e.beginPath(),e.arc(t,o,2.2,0,Math.PI*2),e.fill(),d>0&&(e.globalAlpha=1-d,e.beginPath(),e.arc(t,o,v+d*26,0,Math.PI*2),e.stroke(),e.globalAlpha=1),s){e.shadowBlur=0,e.font="600 11.5px 'Chakra Petch', sans-serif",e.letterSpacing="1.4px",e.textAlign="left",e.textBaseline="middle";let g=e.measureText(s).width+10;e.fillStyle="rgba(22,33,47,.85)",e.fillRect(t+v+8,o-7,g,14),e.fillStyle=n,e.fillText(s,t+v+13,o)}e.restore()}function Jt(e,t,o,n){let s=156543.03392*Math.cos(t.lat*Math.PI/180)/Math.pow(2,t.zoom),v=s*110/1609.344,y=[1,2,5,10,20,50,100,200,500,1e3].reduce((i,c)=>Math.abs(c-v)<Math.abs(i-v)?c:i),w=y*1609.344/s;e.save(),e.strokeStyle="rgba(221,226,232,.75)",e.lineWidth=1,e.beginPath(),e.moveTo(o,n-4),e.lineTo(o,n),e.lineTo(o+w,n),e.lineTo(o+w,n-4),e.stroke(),e.font="500 11.5px 'JetBrains Mono', monospace",e.fillStyle="rgba(221,226,232,.75)",e.textAlign="center",e.textBaseline="bottom",e.fillText(`${y} mi`,o+w/2,n-5),e.restore()}var ua=5;function hn(e){e.className="view radar",e.innerHTML=`
    <div class="radar-wrap">
      <div class="panel bare radar-main">
        <canvas class="fill" id="r-map"></canvas>
        <div class="radar-hud">
          <div class="radar-stamp"><b id="r-time">\u2014</b><span id="r-age">\u2014</span></div>
          <div class="radar-legend" id="r-legend"></div>
        </div>
        <div class="radar-tools">
          <button class="tl-btn sm" id="r-center" title="Recentre on location">\u2316</button>
          <button class="tl-btn sm" id="r-zin" title="Zoom in">+</button>
          <button class="tl-btn sm" id="r-zout" title="Zoom out">\u2212</button>
          <button class="tl-btn sm on" id="r-labels" title="Place labels">A</button>
          <button class="tl-btn sm on" id="r-alerts" title="Alert polygons">\u26A0</button>
        </div>
        <div class="radar-frames">
          <button class="tl-btn" id="r-play">\u275A\u275A</button>
          <canvas id="r-strip"></canvas>
        </div>
      </div>

      <div class="radar-side">
        <div class="panel">
          <div class="hd">COVERAGE<span class="rule"></span><span class="val" id="r-src">RAINVIEWER</span></div>
          <div class="body" id="r-cover"></div>
        </div>
        <div class="panel grow" style="--ac:var(--rd)">
          <div class="hd">WATCHES &amp; WARNINGS<span class="rule"></span><span class="val" id="r-alertn">0</span></div>
          <div class="body" id="r-alertlist" style="overflow-y:auto"></div>
        </div>
        <div class="panel">
          <div class="hd" style="--ac:var(--am)">CONVECTIVE<span class="rule"></span><span class="val">STORM FUEL</span></div>
          <div class="body" id="r-conv"></div>
        </div>
      </div>
    </div>
  `;let t=A=>e.querySelector("#"+A),o=[],n=0,s=0,d=!1,v=0,g="",y=null,w=performance.now(),i="",c=new ft(t("r-map"),{center:[r.loc?.lat??0,r.loc?.lon??0],zoom:7,minZoom:3,maxZoom:11,onMove:()=>p()}),M=A=>(C,O,E)=>!A||!i?null:`${i}${A.path}/256/${C}/${O}/${E}/4/1_1.png`;c.layers=[{name:"base",url:(A,C,O)=>`${ht}/World_Dark_Gray_Base/MapServer/tile/${A}/${O}/${C}`,filter:Yt,opacity:1},{name:"radar",url:(A,C,O)=>M(o[n])(A,C,O),opacity:.82,blend:"screen",maxTileZoom:7},{name:"labels",url:(A,C,O)=>`${ht}/World_Dark_Gray_Reference/MapServer/tile/${A}/${O}/${C}`,filter:xt,opacity:1}];let f=A=>c.layers.find(C=>C.name===A);c.overlays.push((A,C)=>{if(f("alerts")?.enabled!==!1&&l)for(let O of r.alerts){if(!O.geometry)continue;let E=yt(O.event,O.severity);fn(A,C,O.geometry,{stroke:E,fill:V(E,.12),width:1.5,glow:10})}if(r.loc){let[O,E]=C.project(r.loc.lat,r.loc.lon);Zt(A,O,E,j[1],r.loc.name.toUpperCase())}Jt(A,C,14,C.h-14),A.save(),A.strokeStyle="rgba(63,208,216,.06)",A.lineWidth=1;for(let O=1;O<4;O++)A.beginPath(),A.moveTo(C.w*O/4,0),A.lineTo(C.w*O/4,C.h),A.moveTo(0,C.h*O/4),A.lineTo(C.w,C.h*O/4),A.stroke();A.restore()});let l=!0,h=de(t("r-strip"),(A,C,O)=>{if(!o.length)return;let E=o.length,D=Math.max(2,C/E-2),z=o.findIndex(U=>U.kind==="nowcast");if(o.forEach((U,W)=>{let P=W*C/E,q=U.kind==="past",te=W===n?j[1]:q?j[0]:R.warn;A.fillStyle=V(te,W===n?1:.3),A.fillRect(P,W===n?2:6,D,W===n?O-4:O-12)}),z>0){let U=z*C/E-1;A.save(),A.strokeStyle=V(R.warn,.8),A.setLineDash([2,2]),A.beginPath(),A.moveTo(U,0),A.lineTo(U,O),A.stroke(),A.restore()}},{onPick:({x:A,w:C})=>{if(!o.length)return;let O=o[N(Math.floor(A/C*o.length),0,o.length-1)];r.playing=!1,r.emit("play",!1),r.scrubTo(O.time*1e3)}});function a(A){let C=0,O=1/0;for(let E=0;E<o.length;E++){let D=Math.abs(o[E].time*1e3-A);D<O&&(O=D,C=E)}return C}function u(){if(!o.length)return;let A=a(r.cursor);A!==n&&(n=A,b())}function m(){t("r-play").textContent=r.playing?"\u275A\u275A":"\u25B6"}let p=()=>h.render();function b(){let A=o[n];if(!A)return;t("r-time").textContent=r.fmt.hm(A.time*1e3);let C=Math.round((Date.now()/1e3-A.time)/60);t("r-age").textContent=A.kind==="nowcast"?`FORECAST +${Math.abs(C)}m`:C<=1?"LATEST":`${C} MIN AGO`,t("r-age").style.color=A.kind==="nowcast"?R.warn:C<=12?R.good:pe,c.invalidate(),h.render()}async function T(){try{let A=r.radar||await ce.radar();i=A.host;let C=(A.radar?.past||[]).map(E=>({...E,kind:"past"})),O=(A.radar?.nowcast||[]).map(E=>({...E,kind:"nowcast"}));o=[...C,...O],n=a(r.cursor),t("r-src").textContent=O.length?`${C.length} OBS + ${O.length} FCST`:`${C.length} OBSERVED`,b(),$()}catch(A){console.error("[radar] frames",A),t("r-src").textContent="UNAVAILABLE"}}function $(){let A=[["#62a4ef","light"],["#6cc98f","moderate"],["#ecd46a","heavy"],["#f59a5b","very heavy"],["#f47171","intense"],["#c89af5","hail"]];t("r-legend").innerHTML='<span class="lg-title">intensity</span>'+A.map(([C,O])=>`<b><i style="background:${C}"></i>${O}</b>`).join("")}function k(){let A=r.fmt,C=r.frame(),O=[C?.t,C?.precip,C?.cape,C?.cloud,r.alerts.length,r.hours.length].join("|");if(O===g&&r.raw===y)return;g=O,y=r.raw;let E=r.alerts;t("r-alertn").textContent=String(E.length),t("r-alertlist").innerHTML=E.length?E.map(Q=>`
      <div class="alert-item" style="--ac:${yt(Q.event,Q.severity)}">
        <b>${oe(Q.event)}</b>
        <span>${oe(Q.areaDesc||"").slice(0,90)}</span><br>
        <span>until ${A.weekday(Q.expires)} ${A.hm(Q.expires)}</span>
      </div>`).join(""):'<div class="nodata">no active alerts</div>';let D=r.frame(),z=r.hours.filter(Q=>Q.t>=Date.now()&&Q.t<=Date.now()+6*36e5),U=z.reduce((Q,Z)=>Q+(Z.precip??0),0),W=Math.max(0,...z.map(Q=>Q.pop??0));t("r-cover").innerHTML=`
      <dl style="margin:0">
        ${H("Now",D?.wx.label??"--")}
        ${H("Rate",D?.precip!=null?`${D.precip.toFixed(3)} in/hr`:"--")}
        ${H("Next 6h total",`${U.toFixed(2)} in`)}
        ${H("Peak chance 6h",`${Math.round(W)}%`)}
        ${H("Cloud cover",D?.cloud!=null?`${Math.round(D.cloud)}%`:"--")}
        ${H("Freezing level",D?.freezing!=null?`${Math.round(D.freezing*3.28084)} ft`:"--")}
      </dl>`;let P=D?.cape??0,q=D?.li,te=D?.cin,F=P<300?["STABLE",R.good]:P<1e3?["MARGINAL",j[0]]:P<2500?["MODERATE",R.warn]:P<4e3?["STRONG",R.serious]:["EXTREME",R.crit],J=Math.max(0,...r.hours.filter(Q=>Q.t>=Date.now()&&Q.t<=Date.now()+24*36e5).map(Q=>Q.cape??0));t("r-conv").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px">
        <span class="num" style="font-size:1.5rem;font-weight:700;color:${F[1]}">${Math.round(P)}</span>
        <span class="lbl">J/kg CAPE</span>
        <span class="chip" style="--ac:${F[1]};margin-left:auto">${F[0]}</span>
      </div>
      <div class="meter seg" style="--ac:${F[1]};margin-bottom:8px"><i style="width:${N(P/4e3*100,0,100)}%"></i></div>
      <dl style="margin:0">
        ${H("Lifted index",q!=null?q.toFixed(1):"--")}
        ${H("Inhibition",te!=null?`${Math.round(te)} J/kg`:"--")}
        ${H("Peak CAPE 24h",`${Math.round(J)} J/kg`)}
      </dl>
      <div style="font-size:max(.58rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        CAPE is the energy available to a rising parcel. Above ~1000 J/kg with a
        negative lifted index, thunderstorms become plausible.
      </div>`}t("r-play").addEventListener("click",()=>{r.playing=!r.playing,r.emit("play",r.playing),m()}),r.on("play",m),r.on("cursor",()=>{r.view==="radar"&&(u(),m())}),t("r-center").addEventListener("click",()=>{r.loc&&c.setView(r.loc.lat,r.loc.lon,7)}),t("r-zin").addEventListener("click",()=>c.setView(c.lat,c.lon,c.zoom+1)),t("r-zout").addEventListener("click",()=>c.setView(c.lat,c.lon,c.zoom-1)),t("r-labels").addEventListener("click",A=>{let C=f("labels");C.enabled=C.enabled===!1,A.currentTarget.classList.toggle("on",C.enabled!==!1),c.invalidate()}),t("r-alerts").addEventListener("click",A=>{l=!l,A.currentTarget.classList.toggle("on",l),c.invalidate()});function L(A){if(r.view!=="radar"){w=A;return}let C=Math.min(.2,(A-w)/1e3);if(w=A,r.playing&&o.length){if(!d){if(v+=C,!c.tilesSettled("radar")&&v<ua)return;d=!0}s+=C;let O=n===o.length-1?1.1:.42;if(s>=O){let E=-1;for(let D=1;D<=o.length;D++){let z=(n+D)%o.length;if(z===n||c.tilesSettled("radar",M(o[z]))){E=z;break}}if(E<0||E===n){s=O-.1;return}s=0,r.hours.length?r.setCursor(o[E].time*1e3):(n=E,b())}}}requestAnimationFrame(function A(C){requestAnimationFrame(A),L(C)}),r.on("loc",()=>{r.loc&&c.setView(r.loc.lat,r.loc.lon,7)}),r.on("radar",T);let H=(A,C)=>`<div class="kv"><dt>${A}</dt><dd>${C}</dd></div>`;return T(),{map:c,update(){k(),c.invalidate()},onShow(){d=!1,v=0,s=0,c.resize(),h.render(),u(),r.playing=!0,r.emit("play",!0),m()},onHide(){r.playing=!1,r.emit("play",!1),r.following&&r.setCursor(Date.now())}}}function fa(e,t){if(!e?.length)return null;let o=null,n=1/0;for(let s of e){let d=Math.abs(s.t-t);d<n&&(n=d,o=s)}return n<=36e5?o:null}function mn(e,t){for(let o of t){let n=e[o];if(n instanceof Date&&!Number.isNaN(+n))return{at:+n,kind:o}}return null}function ha(e,t,o,n,s){let d=mn(t,["night","nauticalDusk","dusk"]),v=mn(o,["nightEnd","nauticalDawn","dawn"]);if(!d||!v||v.at<=d.at)return{dark:null,samples:[],goodHours:0,score:0,reason:"no darkness"};let g=[],y=Math.ceil(d.at/36e5)*36e5;for(let $=y;$<=v.at;$+=36e5){let k=fa(e,$);if(!k)continue;let L=s($),H=n($)>0;g.push({t:$,cloud:k.cloud??null,moonUp:H,moonLit:L,washed:H&&L>=.25,clear:k.cloud!=null&&k.cloud<=30})}if(!g.length)return{dark:{from:d.at,to:v.at,kind:d.kind},samples:[],goodHours:0,score:0,reason:"beyond the forecast"};let w=$=>$.clear&&!$.washed,i=g.filter(w).length,c=g.filter($=>$.clear).length,M=g.filter($=>$.cloud!=null),f=M.length?M.reduce(($,k)=>$+k.cloud,0)/M.length:null,l=null,h=null;for(let $ of g.concat([null])){if($&&w($)){h=h||{from:$.t,to:$.t},h.to=$.t+36e5;continue}h&&(!l||h.to-h.from>l.to-l.from)&&(l=h),h=null}let a=(v.at-d.at)/36e5,u=s(d.at+(v.at-d.at)/2),m=g.filter($=>$.moonUp).length/g.length,p=l?(l.to-l.from)/36e5:0,b=.65*Math.min(1,p/4)+.25*Math.min(1,i/Math.max(a,1))+.1*Math.min(1,a/6),T=Math.round(100*Math.max(0,Math.min(1,b)-.08*m*u));return{dark:{from:d.at,to:v.at,kind:d.kind,hours:a},samples:g,goodHours:i,clearHours:c,cloudMean:f,moonLit:u,moonUpHours:g.filter($=>$.moonUp).length,best:l,score:T}}function pn(e,t,o,n,s,d=7,v=null){let{sunTimes:g,moonPosition:y,moonIllumination:w,toDeg:i}=s,c=[],M=v==null?(()=>{let h=new Date(n);return h.setHours(12,0,0,0),+h})():Math.floor((n+v)/(24*36e5))*24*36e5+12*36e5-v,f=h=>i(y(new Date(h),t,o).altitude),l=h=>w(new Date(h)).fraction;for(let h=0;h<d;h++){let a=new Date(M+h*24*36e5),u=new Date(M+(h+1)*24*36e5),m=ha(e,g(a,t,o),g(u,t,o),f,l);c.push({...m,index:h,day:+a})}return c}function ho(e){return e.slice(1).reduce((t,o)=>o.score>(t?.score??-1)?o:t,null)}function gn(e,t){let o=e[0],n=i=>t.hm(i);if(!o||!o.dark)return"No real darkness tonight at this latitude.";if(!o.samples.length)return"Tonight is beyond the forecast.";let s=ho(e),d=s&&s.score>o.score+15?s:null,v=i=>i.index===1?"Tomorrow":t.weekday(i.day),g=(i,c)=>`${i} ${c}${i===1?"":"s"}`,y=d?` ${v(d)} is the better night: ${g(d.goodHours,"clear moonless hour")}.`:"";if(o.best&&o.best.to-o.best.from>=2*36e5){let i=(o.best.to-o.best.from)/36e5,c=Math.round(i),M=o.moonLit>=.25&&o.moonUpHours?`, and the moon is ${Math.round(o.moonLit*100)}% lit`:"";if(o.dark.hours-i<1)return`Clear and moonless all night \u2014 about ${g(c,"hour")}, ${n(o.best.from)} to ${n(o.best.to)}${M}.`+y;if(c<3){let f=o.cloudMean!=null&&o.cloudMean>30?`, in a night averaging ${Math.round(o.cloudMean)}% cloud`:o.dark.hours<4?`, which is most of the ${g(Math.round(o.dark.hours),"hour")} of darkness`:"";return`A ${c}-hour window from ${n(o.best.from)}${f}${M}.`+y}return`Clear and moonless from ${n(o.best.from)} to ${n(o.best.to)} \u2014 about ${g(c,"hour")}${M}.`+y}return`Not tonight \u2014 ${o.cloudMean!=null&&o.cloudMean>30?`${Math.round(o.cloudMean)}% cloud through the dark hours`:o.moonUpHours&&o.moonLit>=.25?`a ${Math.round(o.moonLit*100)}% moon up for most of it`:"not much dark sky to work with"}.`+y}function vn(e){e.className="view skyview",e.innerHTML=`
    <div class="panel bare dome-panel">
      <canvas class="fill" id="s-dome"></canvas>
      <div class="dome-cap"><span class="lbl">CELESTIAL DOME</span><span class="lbl" id="s-domewhen">\u2014</span></div>
    </div>

    <div class="panel moon-panel" style="--ac:var(--ice)">
      <div class="hd">MOON<span class="rule"></span><span class="val" id="s-mphase">\u2014</span></div>
      <div class="body moon-body">
        <canvas id="s-moon"></canvas>
        <dl id="s-moondl" style="margin:0;flex:1"></dl>
      </div>
      <canvas id="s-moonalt" style="flex:1;min-height:58px;width:100%;margin-top:6px"></canvas>
    </div>

    <div class="panel sun-panel" style="--ac:var(--am)">
      <div class="hd">SOLAR DAY<span class="rule"></span><span class="val" id="s-daylen">\u2014</span></div>
      <div class="body">
        <canvas id="s-daybar" style="height:52px;flex:0 0 52px;width:100%"></canvas>
        <dl id="s-sundl" style="margin:6px 0 0"></dl>
      </div>
    </div>

    <div class="panel" style="--ac:var(--vi)">
      <div class="hd">GEOMAGNETIC<span class="rule"></span><span class="val" id="s-kpnow">\u2014</span></div>
      <div class="body">
        <canvas id="s-kp" style="flex:1;min-height:70px;width:100%"></canvas>
        <dl id="s-spacedl" style="margin:6px 0 0"></dl>
      </div>
    </div>

    <div class="panel" style="--ac:var(--lm)">
      <div class="hd">OBSERVING CONDITIONS<span class="rule"></span><span class="val" id="s-seenow">\u2014</span></div>
      <div class="body" id="s-seeing"></div>
      <div class="tn" id="s-tonight"></div>
    </div>
  `;let t=a=>e.querySelector("#"+a),o=null;function n(){let{lat:a,lon:u}=r.loc||{lat:0,lon:0},m=r.fmt.isoDate(r.cursor),p=r.cursor;for(;r.fmt.isoDate(p-6e4)===m;)p-=6e4;let b=[],T=[];for(let $=0;$<=1440;$+=10){let k=new Date(p+$*6e4),L=Je(k,a,u),H=Qe(k,a,u);b.push({az:ze(L.azimuth),alt:_e(L.altitude),t:+k}),T.push({az:ze(H.azimuth),alt:_e(H.altitude),t:+k})}return{sun:b,moon:T,t0:p}}let s=de(t("s-dome"),(a,u,m,p)=>{let b=r.frame();if(!b)return;let{sun:T,moon:$}=n(),k=Math.min(u,m)/2-26,L=u/2,H=m/2;Vo(a,L,H,k,{sunTrack:T,moonTrack:$,sun:{az:b.sun.compass,alt:b.sun.altDeg},moon:{az:b.moon.compass,alt:b.moon.altDeg},iss:o&&o.alt>0?o:null,night:b.sun.altDeg<-6?1:0}),a.save(),a.font="500 12px 'JetBrains Mono', monospace",a.textAlign="left",a.textBaseline="top";let A=[["SUN",`${b.sun.altDeg.toFixed(1)}\xB0  ${me(b.sun.compass)}`,"#f2b45a"],["MOON",`${b.moon.altDeg.toFixed(1)}\xB0  ${me(b.moon.compass)}`,"#7fb2f0"]];o&&A.push(["ISS",`${o.alt>0?`${o.alt.toFixed(0)}\xB0 ${me(o.az)}`:"below horizon"}`,"#8fdc6a"]),A.forEach(([C,O,E],D)=>{a.fillStyle=E,a.fillText(C,10,10+D*15),a.fillStyle=ye,a.fillText(O,52,10+D*15)}),a.restore()}),d=de(t("s-moon"),(a,u,m)=>{let p=r.frame();if(!p)return;let b=Math.min(u,m)/2-4;Ft(a,u/2,m/2,Math.max(10,b),p.moon.phase,p.moon.fraction)}),v=de(t("s-moonalt"),(a,u,m)=>{let{sun:p,moon:b}=n(),T={l:2,r:22,t:12,b:12},$={x:T.l,y:T.t,w:u-T.l-T.r,h:m-T.t-T.b};if($.w<30||$.h<20)return;let k=A=>$.y+$.h-(N(A,-60,90)+60)/150*$.h,L=A=>$.x+A/(b.length-1)*$.w;a.save(),a.strokeStyle="rgba(63,208,216,.30)",a.setLineDash([3,3]),a.beginPath(),a.moveTo($.x,k(0)),a.lineTo($.x+$.w,k(0)),a.stroke(),a.setLineDash([]),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="right",a.textBaseline="middle",a.fillText("0\xB0",$.x+$.w+18,k(0)),a.restore(),Te(a,p.map((A,C)=>[L(C),k(A.alt)]),"#f2b45a",{width:1.4,glow:6}),a.save(),a.setLineDash([3,3]),Te(a,b.map((A,C)=>[L(C),k(A.alt)]),"#7fb2f0",{width:1.6,glow:7}),a.restore();let H=N(Math.round((r.cursor-b[0].t)/(b.at(-1).t-b[0].t)*(b.length-1)),0,b.length-1);a.save(),a.strokeStyle=j[1],a.lineWidth=1,a.beginPath(),a.moveTo(L(H),$.y),a.lineTo(L(H),$.y+$.h),a.stroke(),a.restore(),a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="center",a.textBaseline="top";for(let A=0;A<=24;A+=6)A!==24&&He(a,String(A).padStart(2,"0"),L(A/24*(b.length-1)),m-T.b+1,0,u);a.restore(),Se(a,$.x+2,1,"altitude \u2014 sun solid, moon dashed")}),g=de(t("s-daybar"),(a,u,m)=>{let p=r.sunTimesFor(),b=r.fmt.isoDate(r.cursor),T=r.cursor;for(;r.fmt.isoDate(T-6e4)===b;)T-=6e4;let $=T+24*36e5,k=E=>(E-T)/($-T)*u,L=8,H=16,A=(E,D,z)=>{if(E==null||D==null||isNaN(+E)||isNaN(+D))return;let U=N(k(+E),0,u),W=N(k(+D),0,u);W<=U||(a.fillStyle=z,a.fillRect(U,L,W-U,H))};a.fillStyle="#0f1826",a.fillRect(0,L,u,H),A(p.nightEnd,p.nauticalDawn,"rgba(30,20,70,.9)"),A(p.nauticalDawn,p.dawn,"rgba(40,40,120,.9)"),A(p.dawn,p.sunrise,"rgba(90,60,150,.9)"),A(p.sunrise,p.goldenHourEnd,"rgba(245,154,91,.85)"),A(p.goldenHourEnd,p.goldenHour,"rgba(90,180,235,.75)"),A(p.goldenHour,p.sunset,"rgba(245,154,91,.85)"),A(p.sunset,p.dusk,"rgba(150,70,140,.9)"),A(p.dusk,p.nauticalDusk,"rgba(60,45,130,.9)"),A(p.nauticalDusk,p.night,"rgba(30,20,70,.9)"),a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="center",a.textBaseline="top",a.strokeStyle="rgba(255,255,255,.10)";for(let E=0;E<=24;E+=3){let D=E/24*u;a.beginPath(),a.moveTo(D,L+H),a.lineTo(D,L+H+3),a.stroke(),E%6===0&&E<24&&He(a,String(E).padStart(2,"0"),D,L+H+5,0,u)}a.restore();let C=(E,D,z)=>{if(E==null||isNaN(+E))return;let U=N(k(+E),6,u-6);a.save(),a.strokeStyle=z,a.lineWidth=1,a.beginPath(),a.moveTo(U,L-4),a.lineTo(U,L+H),a.stroke(),a.font="600 11.5px 'Chakra Petch', sans-serif",a.fillStyle=z,a.textAlign="center",a.textBaseline="bottom",a.fillText(D,U,L-5),a.restore()};C(p.sunrise,"\u2191","#f2b45a"),C(p.sunset,"\u2193","#f2b45a");let O=N(k(r.cursor),0,u);a.save(),a.strokeStyle=j[1],a.lineWidth=1.5,a.shadowColor=j[1],a.shadowBlur=4,a.beginPath(),a.moveTo(O,L-6),a.lineTo(O,L+H+2),a.stroke(),a.restore()}),y=de(t("s-kp"),(a,u,m,p)=>{let b=r.kpForecast();if(!b.length){w(a,u,m,"no space weather data");return}Xo(a,u,m,p,{rows:b,tf:r.fmt,now:Date.now()})});function w(a,u,m,p){a.save(),a.font="600 11.5px 'Chakra Petch', sans-serif",a.fillStyle=se,a.textAlign="center",a.textBaseline="middle",a.letterSpacing="1.6px",a.fillText(p.toUpperCase(),u/2,m/2),a.restore()}function i(a,u=Date.now()){let m=u,p=6*36e5,b=Xe(new Date(m)).phase;for(let T=0;T<240;T++){m+=p;let $=Xe(new Date(m)).phase;if(b<=a&&$>=a||b>$&&(b<=a||$>=a)){let L=m-p,H=m;for(let A=0;A<28;A++){let C=(L+H)/2,O=Xe(new Date(C)).phase;O<a||O>.9&&a<.1?L=C:H=C}return(L+H)/2}b=$}return null}function c(){let a=r.frame();if(!a)return;let u=r.fmt;t("s-domewhen").textContent=r.atNow?"LIVE":`${u.weekday(r.cursor)} ${u.hm(r.cursor)}`;let m=r.moonTimesFor();t("s-mphase").textContent=So(a.moon.phase).toUpperCase();let p=i(.5),b=i(0);t("s-moondl").innerHTML=`
      ${l("Illumination",`${(a.moon.fraction*100).toFixed(1)}%`)}
      ${l("Altitude",`${a.moon.altDeg.toFixed(1)}\xB0 ${me(a.moon.compass)}`)}
      ${l("Distance",`${Math.round(a.moon.distance).toLocaleString()} km`)}
      ${l("Moonrise",m.rise?u.hm(m.rise):m.alwaysUp?"always up":"\u2014")}
      ${l("Moonset",m.set?u.hm(m.set):m.alwaysDown?"never up":"\u2014")}
      ${l("Next full",p?`${u.monthDay(p)} ${u.hm(p)}`:"\u2014")}
      ${l("Next new",b?`${u.monthDay(b)} ${u.hm(b)}`:"\u2014")}
    `;let T=r.sunTimesFor(),$=a.day;t("s-daylen").textContent=$?.daylight?rt($.daylight):"\u2014";let k="\u2014",L=r.days.findIndex(J=>u.isoDate(J.t)===u.isoDate(r.cursor));if(L>0&&r.days[L].daylight&&r.days[L-1].daylight){let J=r.days[L].daylight-r.days[L-1].daylight,Q=Math.abs(J)/60;k=`${J>=0?"+":"\u2212"}${Math.floor(Q)}m ${Math.round(Q%1*60)}s vs yesterday`}t("s-sundl").innerHTML=`
      ${l("First light",u.hm(T.dawn))}
      ${l("Sunrise",u.hm(T.sunrise))}
      ${l("Golden hour ends",u.hm(T.goldenHourEnd))}
      ${l("Solar noon",`${u.hm(T.solarNoon)} \xB7 ${f().toFixed(1)}\xB0`)}
      ${l("Golden hour",u.hm(T.goldenHour))}
      ${l("Sunset",u.hm(T.sunset))}
      ${l("Civil dusk",u.hm(T.dusk))}
      ${l("Astronomical dark",isNaN(+T.night)?"none tonight":u.hm(T.night))}
      ${l("Day length",k)}
    `;let H=r.currentKp(),A=Ct(H);t("s-kpnow").textContent=H!=null?`Kp ${H.toFixed(2)} \xB7 ${A.name}`:"NO DATA";let C=r.space,O=C?.wind?.ok?C.wind.data?.[0]?.proton_speed:null,E=C?.mag?.ok?C.mag.data?.[0]?.bt:null,D=C?.mag?.ok?C.mag.data?.[0]?.bz_gsm:null,z=C?.scales?.ok?C.scales.data?.["0"]:null;t("s-spacedl").innerHTML=`
      ${l("Solar wind",O!=null?`${O} km/s`:"\u2014")}
      ${l("IMF Bt / Bz",E!=null?`${E} / ${D} nT`:"\u2014")}
      ${l("Aurora visible to",A.lat!=null?`${A.lat}\xB0 latitude`:"\u2014")}
      ${l("Your latitude",`${Math.abs(r.loc.lat).toFixed(1)}\xB0 ${r.loc.lat>=0?"N":"S"}`)}
      ${l("Radio / Solar / Geo",z?`R${z.R?.Scale??0} S${z.S?.Scale??0} G${z.G?.Scale??0}`:"\u2014")}
    `;let U=a.air,W=Gt("stargaze",{...a,air:U},{sunAltDeg:a.sun.altDeg,moonFraction:a.moon.fraction,moonUp:a.moon.altDeg>0}),P=W?.score??0,q=P>=75?R.good:P>=50?R.warn:P>=30?R.serious:R.crit;t("s-seenow").textContent=`${P}/100`;let te=r.hours.filter(J=>J.t>Date.now()&&J.t<Date.now()+30*36e5),F=null;for(let J of te){let Q=r.frame(J.t);if(!Q||Q.sun.altDeg>-12)continue;let Z=Gt("stargaze",Q,{sunAltDeg:Q.sun.altDeg,moonFraction:Q.moon.fraction,moonUp:Q.moon.altDeg>0});(!F||Z.score>F.score)&&(F={t:J.t,score:Z.score,limiter:Z.limiter})}t("s-seeing").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:5px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${q}">${P}</span>
        <span class="lbl">stargazing now</span>
      </div>
      <div class="meter" style="--ac:${q};margin-bottom:9px"><i style="width:${P}%"></i></div>
      ${(W?.parts||[]).map(J=>`
        <div class="kv">
          <dt>${J.name}</dt>
          <dd style="display:flex;align-items:center;gap:6px">
            <span class="meter" style="width:52px;--ac:${J.value>.7?R.good:J.value>.4?R.warn:R.crit}">
              <i style="width:${J.value*100}%"></i></span>
            ${Math.round(J.value*100)}
          </dd>
        </div>`).join("")}
      <div style="margin-top:8px;font-size:max(.66rem,var(--fs-floor,0px));color:var(--dim);line-height:1.5">
        ${F?`Best hour right now: <b style="color:${ye}">${u.weekday(F.t)} ${u.hm(F.t)}</b> at ${F.score}/100${F.limiter?`, held back by ${F.limiter}`:""}.`:"No astronomical darkness in the next 30 hours."}
      </div>`,M(),s.render(),d.render(),v.render(),g.render(),y.render()}function M(){let a=t("s-tonight");if(!r.loc||!r.hours?.length){a.innerHTML="";return}let u=r.fmt,m=pn(r.hours,r.loc.lat,r.loc.lon,Date.now(),{sunTimes:Tt,moonPosition:Qe,moonIllumination:Xe,toDeg:_e}),p=ho(m),b=Math.max(4,...m.map($=>$.goodHours)),T=$=>{let k=p&&$.index===p.index&&$.score>m[0].score,L=$.score>=75?R.good:$.score>=45?R.warn:R.crit;return`
        <div class="tn-n${k?" pick":""}${$.index===0?" now":""}"
             title="${$.goodHours} clear moonless hours of ${$.dark?$.dark.hours.toFixed(1):0} dark">
          <span class="tn-h">${$.dark?`${$.goodHours}h`:"\u2014"}</span>
          <span class="tn-bar"><i style="height:${Math.round($.goodHours/b*100)}%;background:${L}"></i></span>
          <span class="tn-d">${u.weekday($.day).slice(0,3).toUpperCase()}</span>
        </div>`};a.innerHTML=`
      <p class="tn-verdict">${oe(gn(m,u))}</p>
      <div class="tn-week">${m.map(T).join("")}</div>
      <p class="tn-key">clear, moonless hours per night \xB7 next ${7}</p>`}function f(){let{lat:a,lon:u}=r.loc||{lat:0,lon:0},m=r.sunTimesFor();return!m.solarNoon||isNaN(+m.solarNoon)?0:_e(Je(m.solarNoon,a,u).altitude)}let l=(a,u)=>`<div class="kv"><dt>${a}</dt><dd>${u}</dd></div>`;async function h(){if(r.view==="sky")try{let a=await ce.iss();if(a.pos?.ok){let u=a.pos.data,m=r.loc||{lat:0,lon:0};o={...gt(m.lat,m.lon,u.latitude,u.longitude,u.altitude),lat:u.latitude,lon:u.longitude,visibility:u.visibility},s.render()}}catch{}}return setInterval(h,8e3),{update:c,onShow(){h(),s.render(),d.render(),v.render(),g.render(),y.render()}}}var yn=[{key:"pm25",label:"PM2.5",unit:"\xB5g/m\xB3",ref:35,who:15,note:"fine particulate \u2014 lungs and bloodstream"},{key:"pm10",label:"PM10",unit:"\xB5g/m\xB3",ref:150,who:45,note:"coarse dust and pollen fragments"},{key:"o3",label:"Ozone",unit:"\xB5g/m\xB3",ref:140,who:100,note:"photochemical smog, peaks mid-afternoon"},{key:"no2",label:"NO\u2082",unit:"\xB5g/m\xB3",ref:200,who:25,note:"traffic and combustion"},{key:"so2",label:"SO\u2082",unit:"\xB5g/m\xB3",ref:350,who:40,note:"industry and shipping"},{key:"co",label:"CO",unit:"\xB5g/m\xB3",ref:1e4,who:4e3,note:"incomplete combustion"}],pa=["I very fair","II fair","III medium","IV olive","V brown","VI dark"];function wn(e){e.className="view airview",e.innerHTML=`
    <div class="panel aqi-panel">
      <div class="hd">AIR QUALITY<span class="rule"></span><span class="val" id="a-src">US EPA AQI</span></div>
      <div class="body aqi-body">
        <canvas id="a-gauge"></canvas>
        <div class="aqi-meta">
          <div class="aqi-cat" id="a-cat">\u2014</div>
          <div class="aqi-note" id="a-note">\u2014</div>
          <dl id="a-dl" style="margin:8px 0 0"></dl>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="hd" style="--ac:var(--mg)">POLLUTANTS<span class="rule"></span><span class="val">vs EPA / WHO limits</span></div>
      <div class="body" id="a-poll"></div>
    </div>

    <div class="panel">
      <div class="hd" style="--ac:var(--lm)">POLLEN<span class="rule"></span><span class="val" id="a-polsrc">\u2014</span></div>
      <div class="body" id="a-pollen"></div>
    </div>

    <div class="panel">
      <div class="hd" style="--ac:var(--am)">ULTRAVIOLET<span class="rule"></span><span class="val" id="a-uvnow">\u2014</span></div>
      <div class="body">
        <canvas id="a-uv" style="flex:1;min-height:64px;width:100%"></canvas>
        <div id="a-burn" style="margin-top:6px"></div>
      </div>
    </div>

    <div class="panel">
      <div class="hd" style="--ac:var(--ice)">COMFORT<span class="rule"></span><span class="val" id="a-cmf">\u2014</span></div>
      <div class="body" id="a-comfort"></div>
    </div>

    <div class="panel bare">
      <canvas class="fill" id="a-fc"></canvas>
    </div>
  `;let t=i=>e.querySelector("#"+i),o=de(t("a-gauge"),(i,c,M)=>{let l=r.frame()?.air?.aqi??r.airNow?.aqi,h=Be(l),a=Math.min(c,M)/2-22;Ye(i,c/2,M/2-4,Math.max(18,a),{value:l,min:0,max:300,color:h.color,label:"",unit:"US AQI",bands:[{from:0,to:50,color:R.good},{from:50,to:100,color:R.warn},{from:100,to:150,color:R.serious},{from:150,to:200,color:R.crit},{from:200,to:300,color:"#c89af5"}],ticks:6})}),n=de(t("a-uv"),(i,c,M,f)=>{let l=r.fmt.isoDate(r.cursor),h=r.hours.filter($=>r.fmt.isoDate($.t)===l);if(h.length<2)return;let a={l:2,r:24,t:12,b:14},u={x:a.l,y:a.t,w:c-a.l-a.r,h:M-a.t-a.b},m=$=>u.y+u.h-N($,0,12)/12*u.h;for(let[$,k,L]of[[3,R.good,"LOW"],[6,R.warn,"MOD"],[8,R.serious,"HIGH"],[11,R.crit,"V.HIGH"]])i.save(),i.strokeStyle=V(k,.3),i.setLineDash([3,3]),i.lineWidth=1,i.beginPath(),i.moveTo(u.x,m($)),i.lineTo(u.x+u.w,m($)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=V(k,.8),i.textAlign="right",i.textBaseline="bottom",Le(i,L,u.x+u.w-2,m($)-1),i.restore();let p=h.length,b=Math.max(2,u.w/p-1.5);h.forEach(($,k)=>{let L=$.uv??0;if(L<=.03)return;let H=Ve(L).color;Ke(i,u.x+k*u.w/p,m(L),b,u.y+u.h,V(H,.85))});let T=h.map($=>[u.x+h.indexOf($)*u.w/p+b/2,m($.uvClear??0)]);i.save(),i.setLineDash([3,2]),i.strokeStyle=V(ye,.35),i.lineWidth=1,i.beginPath(),T.forEach(([$,k],L)=>L?i.lineTo($,k):i.moveTo($,k)),i.stroke(),i.restore(),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=se,i.textAlign="center",i.textBaseline="top",h.forEach(($,k)=>{let L=r.fmt.hourOfDay($.t);Math.round(L)%4||Math.abs(L-Math.round(L))>.02||He(i,r.fmt.hm($.t),u.x+k*u.w/p+b/2,M-a.b+3,0,c)}),i.restore(),Se(i,u.x+2,1,"uv index today \xB7 dashed = clear sky")}),s=de(t("a-fc"),(i,c,M,f)=>{let l=r.air.filter(L=>L.t>=Date.now()-216e5&&L.t<=Date.now()+3456e5);if(l.length<3){d(i,c,M,"no air quality forecast");return}let h={l:4,r:30,t:16,b:18},a={x:h.l,y:h.t,w:c-h.l-h.r,h:M-h.t-h.b},u=Math.max(110,Math.max(...l.map(L=>L.aqi??0))*1.15),m=L=>a.x+(L-l[0].t)/(l.at(-1).t-l[0].t)*a.w,p=L=>a.y+a.h-N(L,0,u)/u*a.h;for(let[L,H,A]of[[50,R.good,"GOOD"],[100,R.warn,"MODERATE"],[150,R.serious,"SENSITIVE"]])L>u||(i.save(),i.strokeStyle=V(H,.28),i.setLineDash([4,3]),i.beginPath(),i.moveTo(a.x,p(L)),i.lineTo(a.x+a.w,p(L)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=V(H,.85),i.textAlign="right",i.textBaseline="bottom",Le(i,A,a.x+a.w-2,p(L)-2),i.restore());let b=l.length,T=Math.max(1,a.w/b-.5);l.forEach((L,H)=>{L.aqi!=null&&Ke(i,a.x+H*a.w/b,p(L.aqi),T,a.y+a.h,V(Be(L.aqi).color,.8),2)}),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=se,i.textAlign="center",i.textBaseline="top",i.strokeStyle="rgba(255,255,255,.07)";let $="";l.forEach((L,H)=>{let A=r.fmt.isoDate(L.t);if(A===$)return;$=A;let C=a.x+H*a.w/b;i.beginPath(),i.moveTo(C,a.y),i.lineTo(C,a.y+a.h),i.stroke(),C<a.x+a.w-20&&i.fillText(r.fmt.weekday(L.t).toUpperCase(),C+16,M-h.b+4)}),i.restore();let k=m(Date.now());if(k>a.x&&k<a.x+a.w&&(i.save(),i.strokeStyle=V(R.good,.85),i.setLineDash([3,3]),i.beginPath(),i.moveTo(k,a.y),i.lineTo(k,a.y+a.h),i.stroke(),i.restore()),Se(i,a.x+2,3,"us aqi \u2014 next 4 days"),f&&f.x>a.x&&f.x<a.x+a.w){let L=N(Math.round((f.x-a.x)/a.w*(b-1)),0,b-1),H=l[L],A=Be(H.aqi);i.save(),i.strokeStyle="rgba(255,255,255,.3)",i.beginPath(),i.moveTo(m(H.t),a.y),i.lineTo(m(H.t),a.y+a.h),i.stroke(),i.restore(),ot(i,m(H.t),f.y,[`${r.fmt.weekday(H.t)} ${r.fmt.hm(H.t)}|`,`AQI|${Math.round(H.aqi??0)}`,`CATEGORY|${A.name}`,`PM2.5|${H.pm25?.toFixed(1)??"--"}`,`OZONE|${H.o3?.toFixed(0)??"--"}`],c,M,A.color,{pin:f.coarse})}});function d(i,c,M,f){i.save(),i.font="600 11.5px 'Chakra Petch', sans-serif",i.fillStyle=se,i.textAlign="center",i.textBaseline="middle",i.letterSpacing="1.6px",i.fillText(f.toUpperCase(),c/2,M/2),i.restore()}function v(){let i=r.frame();if(!i)return;let c=i.air||r.airNow,M=c?.aqi,f=Be(M);t("a-cat").textContent=f.name,t("a-cat").style.color=f.color,t("a-note").textContent=y(M);let l=null;if(c)for(let b of yn){let T=c[b.key];if(T==null)continue;let $=T/b.ref;(!l||$>l.frac)&&(l={...b,value:T,frac:$})}t("a-dl").innerHTML=`
      ${w("Dominant",l?`${l.label} ${l.value.toFixed(1)} ${l.unit}`:"\u2014")}
      ${w("PM2.5",c?.pm25!=null?`${c.pm25.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
      ${w("Ozone",c?.o3!=null?`${c.o3.toFixed(0)} \xB5g/m\xB3`:"\u2014")}
      ${w("Aerosol depth",c?.aod!=null?c.aod.toFixed(3):"\u2014")}
      ${w("Dust",c?.dust!=null?`${c.dust.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
    `,t("a-poll").innerHTML=yn.map(b=>{let T=c?.[b.key];if(T==null)return"";let $=N(T/b.ref*100,0,100),k=T>b.who,L=$>100?R.crit:$>66?R.serious:$>33?R.warn:R.good;return`
        <div style="margin-bottom:7px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
            <span class="lbl" style="color:var(--dim)">${b.label}</span>
            <span class="num" style="font-size:max(.72rem,var(--fs-floor,0px));color:${L}">${T.toFixed(T<10?1:0)}<span style="color:var(--faint);font-size:max(.85em,var(--fs-floor,0px))"> ${b.unit}</span></span>
          </div>
          <div class="meter" style="--ac:${L};margin:3px 0 2px;position:relative">
            <i style="width:${$}%"></i>
            <span style="position:absolute;left:${N(b.who/b.ref*100,0,100)}%;top:-2px;bottom:-2px;width:1px;background:rgba(255,255,255,.5)"></span>
          </div>
          <div style="font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint)">${b.note}${k?' \xB7 <b style="color:'+R.serious+'">above WHO guideline</b>':""}</div>
        </div>`}).join("")||'<div class="nodata">no pollutant data</div>',g();let h=i.uv;t("a-uvnow").textContent=h!=null?`${h.toFixed(1)} \xB7 ${Ve(h).name}`:"\u2014";let a=i.day?.uvMax;t("a-burn").innerHTML=h>0||a>0?`
      <div class="lbl" style="margin-bottom:4px">time to burn at today's peak (UV ${(a??h).toFixed(1)})</div>
      <div class="burngrid">
        ${pa.map((b,T)=>{let $=Lt(a??h,T+1),k=$==null?pe:$<15?R.crit:$<30?R.serious:$<60?R.warn:R.good;return`<div><span class="lbl">${b}</span><b style="color:${k}">${$==null?"\u2014":$+"m"}</b></div>`}).join("")}
      </div>`:'<div class="nodata">no uv exposure right now</div>';let u=je(i.dew);t("a-cmf").textContent=u.name;let m=i.feels,p=m!=null&&i.temp!=null?m-i.temp:null;t("a-comfort").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:6px">
        <span class="num" style="font-size:1.7rem;font-weight:700;color:${u.color}">${Y.temp(i.dew)}</span>
        <span class="lbl">dew point</span>
      </div>
      <div class="dewstrip">
        ${[[-99,30,"VERY DRY"],[30,45,"DRY"],[45,55,"COMFORTABLE"],[55,60,"STICKY"],[60,65,"HUMID"],[65,70,"OPPRESSIVE"],[70,99,"MISERABLE"]].map(([T,$,k])=>`<i class="${i.dew!=null&&i.dew>=T&&i.dew<$?"on":""}" style="--c:${je((T+$)/2).color}" title="${k}"></i>`).join("")}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:max(.46rem,var(--fs-floor,0px));color:var(--faint);letter-spacing:.08em;margin-top:2px">
        <span>DRY</span><span>COMFORTABLE</span><span>OPPRESSIVE</span>
      </div>
      <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin:6px 0 8px">${u.note}</div>
      <dl style="margin:0">
        ${w("Air temperature",Y.temp(i.temp))}
        ${w("Feels like",`${Y.temp(i.feels)}${p!=null&&Math.abs(p)>=1?` (${Y.signed(p,0)}\xB0)`:""}`)}
        ${w("Relative humidity",Y.pct(i.rh))}
        ${w("Wet bulb",Y.temp(i.wetbulb))}
        ${w("Vapour deficit",i.vpd!=null?`${i.vpd.toFixed(2)} kPa`:"\u2014")}
      </dl>
      <div style="font-size:max(.56rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Dew point predicts how the air feels far better than relative humidity,
        which only tells you how close the air is to saturation at its own temperature.
      </div>`,o.render(),n.render(),s.render()}function g(){let i=r.pollen,c=r.fmt;if(!i||i.source==="none"){let l=r.frame()?.air,h=l&&["grass","birch","alder","ragweed","olive","mugwort"].map(a=>[a,l[a]]).filter(([,a])=>a!=null);if(h?.length){t("a-polsrc").textContent="CAMS EUROPE",t("a-pollen").innerHTML=h.map(([a,u])=>`
          <div class="kv"><dt>${a}</dt><dd>${u.toFixed(1)} grains/m\xB3</dd></div>`).join("");return}t("a-polsrc").textContent="NO COVERAGE",t("a-pollen").innerHTML=`<div class="nodata">
        pollen data unavailable here<br><span style="color:var(--faint);text-transform:none;letter-spacing:0">
        ${oe(i?.reason||"no source covers this location")}</span></div>`;return}let M=vt(i.index),f=i.yesterday!=null&&i.index!=null?i.index-i.yesterday:null;t("a-polsrc").textContent=i.source.toUpperCase(),t("a-pollen").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${M.color}">${i.index?.toFixed(1)??"--"}</span>
        <div>
          <div class="chip" style="--ac:${M.color}">${M.name}</div>
          <div style="font-size:max(.54rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">of 12${f!=null?` \xB7 ${Y.signed(f,1)} vs yesterday`:""}</div>
        </div>
      </div>
      <div class="meter" style="--ac:${M.color};margin:7px 0 9px"><i style="width:${N(i.index/12*100,0,100)}%"></i></div>
      ${i.triggers?.length?`
        <div class="lbl" style="margin-bottom:4px">today's triggers</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px">
          ${i.triggers.map(l=>`<span class="chip" style="--ac:var(--lm)">${oe(l.name)}</span>`).join("")}
        </div>`:""}
      ${i.forecast?.length?`
        <div class="lbl" style="margin-bottom:4px">5-day outlook</div>
        <div class="pollen-fc">
          ${i.forecast.map(l=>{let h=vt(l.index);return`<div>
              <span class="bar" style="height:${N(l.index/12*100,4,100)}%;--c:${h.color}"></span>
              <b>${l.index.toFixed(1)}</b>
              <span>${c.weekday(Date.parse(l.date))}</span>
            </div>`}).join("")}
        </div>`:""}`}function y(i){return i==null?"no measurement available":i<=50?"Air quality is satisfactory. No restrictions.":i<=100?"Acceptable. Unusually sensitive people may want to limit long outdoor exertion.":i<=150?"Sensitive groups \u2014 asthma, heart or lung conditions, children, older adults \u2014 should reduce prolonged exertion.":i<=200?"Everyone may begin to feel effects. Limit prolonged outdoor exertion.":i<=300?"Health alert. Avoid outdoor exertion; keep windows closed.":"Emergency conditions. Remain indoors with filtration if possible."}let w=(i,c)=>`<div class="kv"><dt>${i}</dt><dd>${c}</dd></div>`;return{update:v,onShow(){o.render(),n.render(),s.render()}}}function bn(e){e.className="view dataview",e.innerHTML=`
    <div class="panel bare data-climate"><canvas class="fill" id="d2-clim"></canvas></div>
    <div class="panel bare data-spread"><canvas class="fill" id="d2-spread"></canvas></div>

    <div class="panel data-stats">
      <div class="hd">TODAY IN THE RECORD<span class="rule"></span><span class="val" id="d2-yrs">\u2014</span></div>
      <div class="body" id="d2-rec"></div>
    </div>

    <div class="panel bare data-trend"><canvas class="fill" id="d2-trend"></canvas></div>

    <div class="panel data-derived">
      <div class="hd" style="--ac:var(--vi)">DERIVED<span class="rule"></span><span class="val">SEASON TO DATE</span></div>
      <div class="body" id="d2-derived"></div>
    </div>

    <div class="panel bare data-meteo"><canvas class="fill" id="d2-meteo"></canvas></div>
  `;let t=f=>e.querySelector("#"+f),o=f=>Eo(f,r.tz);function n(){let f=r.fmt.isoDate(Date.now()),l=r.days.find(h=>r.fmt.isoDate(h.t)===f);return l?l.t:Date.now()-12*36e5}function s(f,l,h,a){f.save(),f.font="600 11.5px 'Chakra Petch', sans-serif",f.fillStyle=se,f.textAlign="center",f.textBaseline="middle",f.letterSpacing="1.6px",f.fillText(a.toUpperCase()+" \u2026",l/2,h/2),f.restore()}let d=de(t("d2-clim"),(f,l,h,a)=>{if(!r.climate){s(f,l,h,"loading 30-year archive");return}Qo(f,l,h,a,{days:r.days.filter(u=>u.t>=n()),climate:r.climate,tf:r.fmt,doyOf:o})}),v=de(t("d2-spread"),(f,l,h,a)=>{if(!r.models){s(f,l,h,"loading model ensemble");return}Jo(f,l,h,a,{rows:r.models.rows,tf:r.fmt,now:Date.now()})}),g=de(t("d2-meteo"),(f,l,h,a)=>{zt(f,l,h,a,{hours:r.hours,days:r.days,tf:r.fmt,span:{lo:r.cursor-24*36e5,hi:r.cursor+96*36e5},cursor:r.cursor,now:Date.now(),panels:["pressure","cloud","uv","cape"]})},{onPick:({x:f,w:l})=>{let h=r.cursor-864e5,a=r.cursor+96*36e5;r.playing=!1,r.scrubTo(h+(f-4)/(l-34)*(a-h))}}),y=de(t("d2-trend"),(f,l,h,a)=>{let u=r.climate?.annual;if(!u?.length){s(f,l,h,"loading climate record");return}let m={l:4,r:34,t:16,b:18},p={x:m.l,y:m.t,w:l-m.l-m.r,h:h-m.t-m.b};if(p.w<40||p.h<30)return;let b=u.map(x=>x.mean),T=Math.min(...b)-.4,$=Math.max(...b)+.4,k=x=>p.x+x/(u.length-1)*p.w,L=x=>p.y+p.h-(x-T)/($-T)*p.h;Ie(f,p,Ge(T,$,Ue(p.h,3)).map(x=>({v:x,y:L(x)})),x=>`${x.toFixed(1)}\xB0`);let H=b.reduce((x,fe)=>x+fe,0)/b.length,A=Math.max(2,p.w/u.length-2);u.forEach((x,fe)=>{let Ce=x.mean-H,ie=Ce>=0?We("#8d9aab","#f2b45a",N(Math.abs(Ce)/1.6,0,1)):We("#8d9aab","#7fb2f0",N(Math.abs(Ce)/1.6,0,1)),ve=L(H),Oe=L(x.mean);f.fillStyle=V(ie,.9),f.fillRect(k(fe)-A/2,Math.min(ve,Oe),A,Math.max(1.5,Math.abs(Oe-ve)))});let C=u.length,O=u.reduce((x,fe)=>x+fe.year,0)/C,E=H,D=0,z=0;for(let x of u)D+=(x.year-O)*(x.mean-E),z+=(x.year-O)**2;let U=z?D/z:0,W=u.map((x,fe)=>[k(fe),L(E+U*(x.year-O))]);f.save(),f.setLineDash([5,3]),Te(f,W,U>=0?"#f2b45a":"#7fb2f0",{width:2,glow:10}),f.restore(),f.save(),f.font="500 11.5px 'JetBrains Mono', monospace",f.fillStyle=se,f.textAlign="center",f.textBaseline="top";let P=5*Ht(Math.ceil(u.length/5),p.w,f.measureText("2020").width);u.forEach((x,fe)=>{x.year%P||He(f,String(x.year),k(fe),h-m.b+4,0,l)}),f.restore(),f.save(),f.font="600 11.5px 'Chakra Petch', sans-serif",f.letterSpacing="1.2px";let q=`TREND ${U>=0?"+":"\u2212"}${Math.abs(U*10).toFixed(2)}\xB0F / DECADE`,te=f.measureText(q).width;f.fillStyle=U>=0?"#f2b45a":"#7fb2f0",f.textAlign="right",f.textBaseline="top",f.fillText(q,p.x+p.w,3),f.restore(),f.save(),f.font=we,f.letterSpacing="1.4px";let F="annual mean temperature \xB0F",J="annual mean \xB0F",Q=x=>f.measureText(x.toUpperCase()).width,Z=Q(F)+te+14<=p.w?F:Q(J)+te+14<=p.w?J:null;if(f.restore(),Z&&Se(f,p.x+2,3,Z),a&&a.x>p.x&&a.x<p.x+p.w){let x=N(Math.round((a.x-p.x)/p.w*(u.length-1)),0,u.length-1),fe=u[x];f.save(),f.fillStyle="rgba(22,33,47,.94)",f.strokeStyle=V(j[0],.5);let Ce=`${fe.year}  ${fe.mean.toFixed(2)}\xB0F  ${fe.mean-H>=0?"+":"\u2212"}${Math.abs(fe.mean-H).toFixed(2)} vs period mean`;f.font="500 11.5px 'JetBrains Mono', monospace";let ie=f.measureText(Ce).width+14,ve=N(k(x)-ie/2,4,Math.max(4,l-ie-4)),Oe=a.coarse&&a.y<h/2?p.y+p.h-20:p.y+2;f.beginPath(),f.rect(ve,Oe,ie,18),f.fill(),f.stroke(),f.fillStyle=ye,f.textAlign="left",f.textBaseline="middle",f.fillText(Ce,ve+7,Oe+9),f.restore()}});function w(){let f=r.fmt,l=r.climate,h=r.dayFor(r.cursor),a=l?.doy?.[o(r.cursor)];if(t("d2-yrs").textContent=l?`${l.years} YEARS \xB7 ${l.start.slice(0,4)}\u2013${l.end.slice(0,4)}`:"\u2014",a&&h){let C=h.tmax-a.normalHigh,O=h.tmin-(a.normalLow??h.tmin),E=N((h.tmax-a.normalHigh)/Math.max(.1,a.recordHigh-a.normalHigh)*100,0,100);t("d2-rec").innerHTML=`
        <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin-bottom:7px">
          ${f.weekday(r.cursor)} ${f.monthDay(r.cursor)} \xB7 forecast against every
          ${f.monthDay(r.cursor)} since ${l.start.slice(0,4)}
        </div>
        <dl style="margin:0">
          ${M("Forecast high",Y.temp(h.tmax),C>=0?"#f2b45a":"#7fb2f0")}
          ${c("Normal high",`${Y.temp(a.normalHigh)}  (${Y.signed(C)}\xB0)`)}
          ${M("Record high",`${Y.temp(a.recordHigh)} in ${a.recordHighYear}`,h.tmax>=a.recordHigh?R.crit:pe)}
          ${c("Forecast low",Y.temp(h.tmin))}
          ${c("Normal low",`${Y.temp(a.normalLow)}  (${Y.signed(O)}\xB0)`)}
          ${M("Record low",`${Y.temp(a.recordLow)} in ${a.recordLowYear}`,h.tmin<=a.recordLow?j[4]:pe)}
        </dl>
        <div class="lbl" style="margin:9px 0 3px">high, normal \u2192 record</div>
        <div class="meter" style="--ac:${E>85?R.crit:R.serious}">
          <i style="width:${E}%"></i></div>
        <div style="display:flex;justify-content:space-between;font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">
          <span>${Y.temp(a.normalHigh)} normal</span><span>${Y.temp(a.recordHigh)} record</span>
        </div>
        <dl style="margin:9px 0 0">
          ${c("Historically wet",`${Math.round(a.wetFrac*100)}% of years`)}
          ${c("Mean precip",`${a.meanPrecip.toFixed(3)} in`)}
          ${c("Forecast precip",`${(h.precip??0).toFixed(2)} in`)}
        </dl>`}else t("d2-rec").innerHTML='<div class="nodata">climate archive loading\u2026</div>';let u=Date.now(),m=r.hours.filter(C=>C.t<=u&&C.t>=u-720*36e5),p=0,b=0,T=0;for(let C of r.days){if(C.tmax==null||C.tmin==null)continue;let O=(C.tmax+C.tmin)/2;C.t>u||(p+=Math.max(0,65-O),b+=Math.max(0,O-65),T+=Math.max(0,Math.min(O,86)-50))}let $=r.models?.rows?.find(C=>C.t>=u),k=$?$.spread<2?["HIGH",R.good]:$.spread<5?["MODERATE",R.warn]:$.spread<9?["LOW",R.serious]:["VERY LOW",R.crit]:null,L=r.models?.rows?.find(C=>C.t>=u+168*36e5),H=r.days.filter(C=>C.t>u).reduce((C,O)=>C+(O.precip??0),0),A=r.days.filter(C=>C.t>u&&(C.precip??0)>=.01).length;t("d2-derived").innerHTML=`
      <dl style="margin:0">
        ${c("Pressure now",`${Y.pressure(r.frame()?.pressure)} inHg`)}
        ${c("3h tendency",i())}
        ${k?M("Forecast confidence",`${k[0]} \xB7 \xB1${($.spread/2).toFixed(1)}\xB0`,k[1]):""}
        ${L?c("Day-7 model spread",`${L.spread.toFixed(1)}\xB0`):""}
        ${c("16-day precip total",`${H.toFixed(2)} in`)}
        ${c("Wet days ahead",`${A} of ${r.days.filter(C=>C.t>u).length}`)}
      </dl>
      <div class="lbl" style="margin:9px 0 3px">degree days, window shown</div>
      <dl style="margin:0">
        ${c("Heating (base 65\xB0F)",Math.round(p))}
        ${c("Cooling (base 65\xB0F)",Math.round(b))}
        ${c("Growing (50/86\xB0F)",Math.round(T))}
      </dl>
      <div style="font-size:max(.55rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Degree days accumulate how far each day's mean sits from a base
        temperature \u2014 the standard proxy for heating load, cooling load and
        crop development.
      </div>`,d.render(),v.render(),y.render(),g.render()}function i(){let f=r.cursor,l=r.hours.find(m=>m.t>=f-3*36e5),h=r.hours.find(m=>m.t>=f);if(!l?.pressure||!h?.pressure)return"\u2014";let a=(h.pressure-l.pressure)*.029529983,u=Math.abs(a)<.02?"steady":Math.abs(a)<.06?"slow":Math.abs(a)<.12?"moderate":"rapid";return`${Y.signed(a,3)} inHg \xB7 ${a>0?"rising":a<0?"falling":""} ${u}`.trim()}let c=(f,l)=>`<div class="kv"><dt>${f}</dt><dd>${l}</dd></div>`,M=(f,l,h)=>`<div class="kv"><dt>${f}</dt><dd style="color:${h}">${l}</dd></div>`;return{update:w,onShow(){d.render(),v.render(),y.render(),g.render()}}}var st=null,ga=()=>st?Promise.resolve(st):import("./sats.OZS22OPN.js").then(e=>st=e),Mn=1852,va=1e4,Sn=24,$n="atmos.sats.v1",ya=5e3,kn=2,Tn=(e,t)=>t?se:We("#f07aa6","#3fd0d8",N((e??0)/38e3,0,1));function En(e){e.className="view overheadview",e.innerHTML=`
    <div class="oh-wrap">
      <div class="panel bare oh-main">
        <canvas class="fill" id="o-map"></canvas>
        <!-- radar-stamp and radar-tools are generic HUD furniture; the names
             are historical, not a coupling to the radar view. -->
        <div class="radar-hud">
          <div class="radar-stamp"><b id="o-count">\u2014</b><span id="o-age">\u2014</span></div>
        </div>
        <div class="radar-tools">
          <button class="tl-btn sm" id="o-center" title="Recentre on you">\u2316</button>
          <button class="tl-btn sm" id="o-zin" title="Zoom in">+</button>
          <button class="tl-btn sm" id="o-zout" title="Zoom out">\u2212</button>
        </div>
      </div>

      <div class="oh-side">
        <div class="panel grow">
          <div class="hd">SELECTED<span class="rule"></span><span class="val" id="o-cs">NOTHING</span></div>
          <div class="body" id="o-sel" style="overflow-y:auto"></div>
        </div>
        <div class="panel" style="--ac:var(--vi)">
          <div class="hd">SATELLITES<span class="rule"></span><span class="val" id="o-satstate">OFF</span></div>
          <div class="body" id="o-satui"></div>
        </div>
        <div class="panel" style="--ac:var(--am)">
          <div class="hd">ALSO UP<span class="rule"></span><span class="val" id="o-lookwhen">NOW</span></div>
          <div class="body" id="o-sky"></div>
        </div>
        <div class="panel grow">
          <div class="hd"><span id="o-neartitle">NEAREST</span><span class="rule"></span><span class="val" id="o-src">\u2014</span></div>
          <div class="body" id="o-near" style="overflow-y:auto"></div>
        </div>
      </div>
    </div>
  `;let t=S=>e.querySelector("#"+S),o=[],n=0,s=null,d=!1,v=!1,g=null,y=null,w=null,i=null,c=!1,M=Object.fromEntries(Re.map(S=>[S.key,S.on]));try{let S=JSON.parse(localStorage.getItem($n)||"null");if(S&&typeof S=="object")for(let I of Re)typeof S[I.key]=="boolean"&&(M[I.key]=S[I.key])}catch{}let f={},l=[],h=null,a=0,u=null,m=[],p=()=>r.loc||{lat:0,lon:0},b=new ft(t("o-map"),{center:[p().lat,p().lon],zoom:9,minZoom:5,maxZoom:12,onTap:S=>T(S)});b.layers=[{name:"base",url:(S,I,G)=>`${ht}/World_Dark_Gray_Base/MapServer/tile/${S}/${G}/${I}`,filter:Yt,opacity:1},{name:"labels",url:(S,I,G)=>`${ht}/World_Dark_Gray_Reference/MapServer/tile/${S}/${G}/${I}`,filter:xt,opacity:.85}],b.overlays.push((S,I)=>{let G=p(),[_,B]=I.project(G.lat,G.lon),K=156543.03392*Math.cos(I.lat*Math.PI/180)/Math.pow(2,I.zoom);S.save(),S.strokeStyle="rgba(63,208,216,.13)",S.setLineDash([2,4]),S.lineWidth=1,S.font="500 11.5px 'JetBrains Mono', monospace",S.fillStyle=j[0],S.textAlign="center",S.textBaseline="bottom";for(let X of[10,20,40]){let ee=X*Mn/K;ee<24||ee>Math.max(I.w,I.h)||(S.beginPath(),S.arc(_,B,ee,0,Math.PI*2),S.stroke(),Le(S,`${X} NM`,_,B-ee-2))}S.restore();for(let X of c?[]:o){let[ee,ne]=I.project(X.lat,X.lon);if(ee<-20||ne<-20||ee>I.w+20||ne>I.h+20)continue;let he=X.hex===g,$e=Tn(X.alt,X.gnd);if(he){let De=(X.gs??0)/60;if(De>.1&&X.trk!=null){let bo=De*Mn/K,Mo=(X.trk-90)*Math.PI/180;S.save(),S.strokeStyle=V($e,.6),S.setLineDash([3,3]),S.lineWidth=1.2,S.beginPath(),S.moveTo(ee,ne),S.lineTo(ee+Math.cos(Mo)*bo,ne+Math.sin(Mo)*bo),S.stroke(),S.restore()}S.save(),S.strokeStyle=$e,S.lineWidth=1.5,S.shadowColor=$e,S.shadowBlur=5,S.beginPath(),S.arc(ee,ne,13,0,Math.PI*2),S.stroke(),S.restore()}if(S.save(),S.translate(ee,ne),S.rotate((X.trk??0)*Math.PI/180),S.fillStyle=$e,he&&(S.shadowColor=$e,S.shadowBlur=4),S.beginPath(),S.moveTo(0,-6.5),S.lineTo(4.5,5),S.lineTo(0,2.4),S.lineTo(-4.5,5),S.closePath(),S.fill(),S.restore(),he&&X.cs){S.save(),S.font="600 11.5px 'Chakra Petch', sans-serif",S.letterSpacing="1.2px",S.textAlign="left",S.textBaseline="middle";let De=S.measureText(X.cs).width+10;S.fillStyle="rgba(22,33,47,.88)",S.fillRect(ee+16,ne-7,De,14),S.fillStyle=$e,S.fillText(X.cs,ee+21,ne),S.restore()}}c&&J(S,I),r.loc&&Zt(S,_,B,"#f07aa6",null),Jt(S,I,12,I.h-12)});function T(S){if(c){let _=null,B=Sn;for(let K of l){let[X,ee]=b.project(K.p.lat,K.p.lon),ne=Math.hypot(X-S.x,ee-S.y);ne<B&&(B=ne,_=K)}Q(_?_.sat.id:null);return}let I=null,G=Sn;for(let _ of o){let[B,K]=b.project(_.lat,_.lon),X=Math.hypot(B-S.x,K-S.y);X<G&&(G=X,I=_)}$(I?I.hex:null)}function $(S){if(g===S||(g=S,y=null,A(),b.invalidate(),!S))return;let I=o.find(G=>G.hex===S);I&&ce.flight(I.cs||"",I.hex||"").then(G=>{g===S&&(y=G,A())}).catch(()=>{})}let k=(S,I)=>`<div class="kv"><dt>${S}</dt><dd>${I}</dd></div>`,L=S=>S==null?"\u2014":`${Math.round(S).toLocaleString()} ft`;function H(S,I){let G=p(),_=Math.PI/180,B=(I-G.lon)*_,K=Math.sin(B)*Math.cos(S*_),X=Math.cos(G.lat*_)*Math.sin(S*_)-Math.sin(G.lat*_)*Math.cos(S*_)*Math.cos(B);return(_e(Math.atan2(K,X))+360)%360}function A(){if(c){x();return}let S=o.find(ee=>ee.hex===g);if(!S){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap an aircraft on the map, or a row in NEAREST.</p>';return}t("o-cs").textContent=S.cs||S.reg||S.hex.toUpperCase();let I=S.vs==null||Math.abs(S.vs)<100?"level":S.vs>0?`climbing ${Math.round(S.vs).toLocaleString()} ft/min`:`descending ${Math.abs(Math.round(S.vs)).toLocaleString()} ft/min`,G=H(S.lat,S.lon),_=[],B=y;B?.airline?_.push(k("Operator",oe(B.airline))):B?.aircraft?.owner&&_.push(k("Operator",oe(B.aircraft.owner)));let K=B?.aircraft?.manufacturer&&B?.aircraft?.type?`${B.aircraft.manufacturer} ${B.aircraft.type}`:S.type;if(K&&_.push(k("Aircraft",oe(K))),S.reg&&_.push(k("Registration",oe(S.reg))),B?.origin||B?.destination){let ee=ne=>ne?`${oe(ne.iata||"??")} <span class="dim">${oe(ne.city||"")}</span>`:"\u2014";_.push(k("From",ee(B.origin))),_.push(k("To",ee(B.destination)))}_.push(k("Altitude",S.gnd?"on the ground":L(S.alt))),_.push(k("Motion",`${S.gs==null?"\u2014":`${Math.round(S.gs)} kt`} \xB7 ${I}`)),_.push(k("Heading",S.trk==null?"\u2014":`${Math.round(S.trk)}\xB0 ${me(S.trk)}`)),_.push(k("From you",`${(S.dst??0).toFixed(1)} nm ${me(G)}`));let X=B&&!B.origin&&S.cs?'<p class="hint">No published route \u2014 usually private or general aviation.</p>':B?.origin?'<p class="hint">Route is by callsign, which airlines reuse day to day.</p>':"";t("o-sel").innerHTML=_.join("")+X}function C(){if(c){fe();return}t("o-neartitle").textContent="NEAREST";let S=o.filter(I=>!I.gnd).slice(0,8);if(t("o-src").textContent=s?s.toUpperCase():"NO FEED",!S.length){t("o-near").innerHTML=v?'<p class="hint">The aircraft feeds are not answering. Trying again shortly.</p>':'<p class="hint">Nothing in the air within range.</p>';return}t("o-near").innerHTML='<div class="oh-head"><span>callsign</span><span>type</span><span>range</span><span>alt</span></div>'+S.map(I=>`
      <button class="oh-row" data-hex="${oe(I.hex)}" aria-pressed="${I.hex===g}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${Tn(I.alt,I.gnd)} 80%, var(--ink))">${oe(I.cs||I.reg||I.hex)}</span>
        <span class="oh-t">${oe(I.type||"")}</span>
        <span class="oh-d">${(I.dst??0).toFixed(1)} nm</span>
        <span class="oh-a">${I.alt==null?"\u2014":`${(I.alt/1e3).toFixed(1)}k`}</span>
      </button>`).join("");for(let I of t("o-near").querySelectorAll(".oh-row"))I.addEventListener("click",()=>{$(I.dataset.hex),C()})}function O(){let S=p(),I=new Date(r.cursor),G=Je(I,S.lat,S.lon),_=Qe(I,S.lat,S.lon),B=(ee,ne,he,$e)=>{let De=ne>0;return`<div class="kv"><dt style="color:${$e}">${ee}</dt><dd>${De?`${ne.toFixed(0)}\xB0 up, ${me(he)}`:'<span class="dim">below the horizon</span>'}</dd></div>`},K=[B("Sun",_e(G.altitude),ze(G.azimuth),"#f2b45a"),B("Moon",_e(_.altitude),ze(_.azimuth),"#7fb2f0")];K.push(w&&w.alt>0?B("ISS",w.alt,w.az,"#8fdc6a"):`<div class="kv"><dt style="color:#8fdc6a">ISS</dt><dd><span class="dim">${w?`below the horizon, ${w.range.toLocaleString()} km away`:"no fix"}</span></dd></div>`);let X=Math.abs(r.cursor-Date.now());t("o-lookwhen").textContent=X<6*6e4?"NOW":`${r.fmt.weekday(r.cursor)} ${r.fmt.hm(r.cursor)}`,t("o-sky").innerHTML=K.join("")+'<p class="hint">Aircraft positions from adsb.lol under ODbL; routes and airframes from adsbdb. Both are run by volunteers.</p>'}function E(){if(c){Ce();return}let S=o.filter(G=>!G.gnd).length;t("o-count").textContent=d?v?"AIRCRAFT FEEDS NOT ANSWERING":`${S} AIRCRAFT`:"\u2014";let I=n?Math.round((Date.now()-n)/1e3):null;t("o-age").textContent=I==null?"\u2014":I<20?"LIVE":`${I}s AGO`}async function D(){if(!(c||r.view!=="overhead"||!r.loc))try{let S=await ce.aircraft(r.loc.lat,r.loc.lon,60);o=S.aircraft||[],n=S.at||Date.now(),s=S.source,v=S.source==null,d=!0,g&&!o.some(I=>I.hex===g)&&$(null),E(),C(),A(),b.invalidate()}catch{}}async function z(){if(!(r.view!=="overhead"||!r.loc))try{let S=await ce.iss();if(S.pos?.ok){let I=S.pos.data;w=gt(r.loc.lat,r.loc.lon,I.latitude,I.longitude,I.altitude),O()}}catch{}}let U=S=>Re.find(I=>I.key===S),W=S=>`${S.lat.toFixed(1)},${S.lon.toFixed(1)}`,P=S=>S<1?`${Math.max(1,Math.round(S*60))} min`:S<48?`${Math.round(S)} h`:`${Math.round(S/24)} days`;async function q(S){let I=f[S.key];if(!(I&&(I.state==="ok"||I.state==="loading"))){f[S.key]={state:"loading",sats:[],fetched:null};try{await ga();let G=new Map,_=1/0;for(let B of S.groups){let K=await fetch(new URL(`/sats/${B}.json`,location.origin));if(!K.ok)throw new Error(`${B} -> ${K.status}`);let X=await K.json(),ee=Date.parse(X.fetched);Number.isFinite(ee)&&(_=Math.min(_,ee));for(let ne of st.prepare(X.records,S.key))G.set(ne.id,ne)}if(!G.size)throw new Error("empty");f[S.key]={state:"ok",sats:[...G.values()],fetched:Number.isFinite(_)?_:null}}catch{f[S.key]={state:"fail",sats:[],fetched:null}}F(!0),ie(),C(),A(),E(),b.invalidate()}}let te={};function F(S){if(!c)return;let I=r.cursor,G=p(),_=[];for(let K of Re){let X=f[K.key];if(!M[K.key]||!X||X.state!=="ok")continue;let ee=te[K.key],ne=K.key==="starlink";if(!S&&ne&&ee&&Math.abs(I-ee.at)<ya){_.push(...ee.list);continue}let he=[];for(let $e of X.sats){let De=st.positionAt($e,I);De&&he.push({sat:$e,p:De,cat:K,look:gt(G.lat,G.lon,De.lat,De.lon,De.altKm)})}te[K.key]={at:I,list:he},_.push(...he)}l=_;let B=l.find(K=>K.sat.id===h);m=B?st.groundTrack(B.sat,I,90,60):[]}function J(S,I){let G=256*Math.pow(2,I.zoom),_=l.find(B=>B.sat.id===h);for(let B of[-G,0,G]){if(_&&m.length){S.save(),S.strokeStyle=V(_.cat.colour,.7),S.setLineDash([4,4]),S.lineWidth=1.4;for(let K of m)S.beginPath(),K.forEach(([X,ee],ne)=>{let[he,$e]=I.project(X,ee);ne?S.lineTo(he+B,$e):S.moveTo(he+B,$e)}),S.stroke();S.restore()}for(let K of l){let[X,ee]=I.project(K.p.lat,K.p.lon),ne=X+B;if(ne<-6||ee<-6||ne>I.w+6||ee>I.h+6)continue;let he=K.cat.key==="starlink";S.fillStyle=K.cat.colour,S.beginPath(),S.arc(ne,ee,he?1.7:3.2,0,Math.PI*2),S.fill()}if(_){let[K,X]=I.project(_.p.lat,_.p.lon),ee=K+B;if(ee<-40||X<-20||ee>I.w+40||X>I.h+20)continue;S.save(),S.strokeStyle=_.cat.colour,S.lineWidth=1.5,S.shadowColor=_.cat.colour,S.shadowBlur=5,S.beginPath(),S.arc(ee,X,10,0,Math.PI*2),S.stroke(),S.restore(),S.save(),S.font="600 11.5px 'Chakra Petch', sans-serif",S.letterSpacing="1.2px",S.textAlign="left",S.textBaseline="middle";let ne=S.measureText(_.sat.name).width+10;S.fillStyle="rgba(22,33,47,.88)",S.fillRect(ee+14,X-7,ne,14),S.fillStyle=_.cat.colour,S.fillText(_.sat.name,ee+19,X),S.restore()}}}function Q(S){h!==S&&(h=S,F(!1),A(),C(),b.invalidate())}let Z=S=>l.filter(I=>W(I.p)===W(S.p)&&I.sat.id!==S.sat.id);function x(){let S=l.find(he=>he.sat.id===h);if(!S){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap a dot on the map, or a row in ABOVE YOU.</p>';return}let{sat:I,p:G,look:_,cat:B}=S;t("o-cs").textContent=I.name;let K=[k("Kind",oe(Et(I.name))),k("Group",oe(B.label)),k("NORAD ID",String(I.id))];I.intl&&K.push(k("Launch",oe(I.intl))),K.push(k("Altitude",`${Math.round(G.altKm).toLocaleString()} km`)),K.push(k("Over",`${Math.abs(G.lat).toFixed(1)}\xB0${G.lat<0?"S":"N"} ${Math.abs(G.lon).toFixed(1)}\xB0${G.lon<0?"W":"E"}`)),K.push(k("From you",_.alt>0?`${_.alt.toFixed(0)}\xB0 up, ${me(_.az)}`:`<span class="dim">below the horizon, ${_.range.toLocaleString()} km away</span>`));let X=st.elementAgeHours(I,r.cursor);K.push(k("Elements",`${X<0?"newer than":""} ${P(Math.abs(X))} ${X<0?"ahead":"old"}`.trim()));let ee=Z(S),ne=ee.length?`<p class="hint">Same orbit data, so same position: ${ee.slice(0,6).map(he=>oe(he.sat.name)).join(", ")}${ee.length>6?` and ${ee.length-6} more`:""}. Docked craft share the station's elements.</p>`:"";t("o-sel").innerHTML=K.join("")+ne+'<p class="hint">Dashed line: next 90 minutes of ground track. Kind is read from the catalogue name.</p>'}function fe(){t("o-neartitle").textContent="ABOVE YOU",t("o-src").textContent="CELESTRAK";let S=new Set,I=l.filter(B=>B.look.alt>0).sort((B,K)=>K.look.alt-B.look.alt),G=[];for(let B of I){let K=W(B.p);if(!S.has(K)&&(S.add(K),G.push({q:B,extra:Z(B).length}),G.length>=8))break}let _=Re.some(B=>M[B.key]&&f[B.key]?.state==="ok");if(!G.length){t("o-near").innerHTML=`<p class="hint">${_?"Nothing in the chosen groups is above your horizon right now.":"Switch on a group above to see what is overhead."}</p>`;return}t("o-near").innerHTML='<div class="oh-head"><span>name</span><span>type</span><span>up</span><span>dir</span></div>'+G.map(({q:B,extra:K})=>`
      <button class="oh-row" data-sat="${B.sat.id}" aria-pressed="${B.sat.id===h}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${B.cat.colour} 80%, var(--ink))">${oe(B.sat.name)}${K?` +${K}`:""}</span>
        <span class="oh-t">${Et(B.sat.name)==="satellite"?"":oe(Et(B.sat.name))}</span>
        <span class="oh-d">${B.look.alt.toFixed(0)}\xB0</span>
        <span class="oh-a">${me(B.look.az)}</span>
      </button>`).join("");for(let B of t("o-near").querySelectorAll(".oh-row"))B.addEventListener("click",()=>Q(Number(B.dataset.sat)))}function Ce(){let S=Re.filter(G=>M[G.key]&&f[G.key]?.state==="ok");t("o-count").textContent=`${l.length.toLocaleString()} SATELLITES`;let I=S.map(G=>f[G.key].fetched).filter(Boolean);t("o-age").textContent=I.length?`ELEMENTS ${P((Date.now()-Math.min(...I))/36e5).toUpperCase()} OLD`:"\u2014"}function ie(){let S=Re.some(_=>M[_.key]&&f[_.key]?.state==="loading"),I=Re.some(_=>M[_.key]&&f[_.key]?.state==="fail");t("o-satstate").textContent=c?S?"LOADING":I?"NO DATA":`${l.length.toLocaleString()} SHOWN`:"OFF";let G=_=>{let B=f[_.key],K=!c||!M[_.key]?"":B?.state==="loading"?" \u2026":B?.state==="fail"?" \u2715":B?.state==="ok"?` ${B.sats.length.toLocaleString()}`:"";return`<button class="oh-chip" data-cat="${_.key}" aria-pressed="${!!M[_.key]}" style="--chip:${_.colour}">${oe(_.label)}${K}</button>`};t("o-satui").innerHTML=`
      <button class="oh-chip oh-mode" data-mode="1" aria-pressed="${c}">${c?"Back to aircraft":"Show satellites on map"}</button>
      <div class="oh-chips">${Re.map(G).join("")}</div>
      ${I?'<p class="hint">Satellite elements are not available here. They are published to branyontech.com every two hours.</p>':""}
      ${c&&M.starlink?'<p class="hint">Starlink is thousands of objects: a large download, loaded only when on.</p>':""}
      ${c?'<p class="hint">Elements: CelesTrak. Positions computed here (SGP4).</p>':""}`}function ve(){try{localStorage.setItem($n,JSON.stringify(M))}catch{}}function Oe(S){if(c!==S){if(c=S,clearInterval(u),u=null,S){$(null),b.minZoom=1;let I=p();b.setView(N(I.lat*.5,-40,40),I.lon,kn);for(let G of Re)M[G.key]&&q(G);r.view==="overhead"&&(u=setInterval(()=>{F(!1),Ce(),C(),b.invalidate()},1e3)),F(!0)}else h=null,m=[],l=[],b.minZoom=5,b.setView(p().lat,p().lon,9),D();ie(),A(),C(),E(),b.invalidate()}}return t("o-satui").addEventListener("click",S=>{let I=S.target.closest("button");if(!I)return;if(I.dataset.mode){Oe(!c);return}let G=U(I.dataset.cat);G&&(M[G.key]=!M[G.key],ve(),c&&M[G.key]&&q(G),F(!0),h!=null&&!l.some(_=>_.sat.id===h)&&(h=null),ie(),A(),C(),E(),b.invalidate())}),t("o-center").addEventListener("click",()=>{r.loc&&(c?b.setView(N(r.loc.lat*.5,-40,40),r.loc.lon,kn):b.setView(r.loc.lat,r.loc.lon,9))}),t("o-zin").addEventListener("click",()=>b.setView(b.lat,b.lon,b.zoom+1)),t("o-zout").addEventListener("click",()=>b.setView(b.lat,b.lon,b.zoom-1)),r.on("loc",()=>{if(r.loc){if(c){F(!0),C(),b.invalidate(),z();return}b.setView(r.loc.lat,r.loc.lon,9),D(),z()}}),A(),O(),ie(),r.on("cursor",()=>{r.view==="overhead"&&(O(),c&&(F(!1),A(),C(),b.invalidate()))}),{map:b,update(){O(),b.invalidate()},onShow(){b.resize(),D(),z(),clearInterval(i),i=setInterval(()=>{D(),E()},va),c&&!u&&(u=setInterval(()=>{F(!1),Ce(),C(),b.invalidate()},1e3))},onHide(){clearInterval(i),i=null,clearInterval(u),u=null}}}var le=null,qe=null,Qt=!1,Pe=null,wa=0,St=1/0;function An(e,t=4){let o=e.createBuffer(1,e.sampleRate*t,e.sampleRate),n=o.getChannelData(0);for(let s=0;s<n.length;s++)n[s]=Math.random()*2-1;return o}function mo(e,t,{type:o,freq:n,q:s,gain:d}){let v=e.createBufferSource();v.buffer=An(e),v.loop=!0;let g=e.createBiquadFilter();g.type=o,g.frequency.value=n,g.Q.value=s;let y=e.createGain();return y.gain.value=d,v.connect(g).connect(y).connect(t),v.start(),{src:v,filt:g,gain:y}}function Ln(){if(le)return;let e=window.AudioContext||window.webkitAudioContext;if(!e)return;le=new e,qe=le.createGain(),qe.gain.value=0;let t=le.createDynamicsCompressor();t.threshold.value=-18,t.ratio.value=6,t.attack.value=.004,t.release.value=.25,qe.connect(t).connect(le.destination);let o=mo(le,qe,{type:"bandpass",freq:1400,q:.7,gain:0}),n=mo(le,qe,{type:"highpass",freq:4200,q:.5,gain:0}),s=mo(le,qe,{type:"bandpass",freq:420,q:1.6,gain:0}),d=le.createOscillator(),v=le.createGain();d.frequency.value=.07,v.gain.value=180,d.connect(v).connect(s.filt.frequency),d.start();let g=le.createGain();g.gain.value=0;let y=le.createBiquadFilter();y.type="lowpass",y.frequency.value=480,y.Q.value=.6,y.connect(g).connect(qe);let w=[0,3.5].map(i=>{let c=le.createOscillator();c.type="sawtooth",c.frequency.value=55,c.detune.value=i;let M=le.createGain();return M.gain.value=.22,c.connect(M).connect(y),c.start(),c});Pe={rain:o,patter:n,wind:s,drone:{oscs:w,gain:g,filt:y},lfo:d,lfoGain:v}}function it(){return Qt}function Cn(e){Qt=e,le&&(e&&le.state==="suspended"&&le.resume(),xe(qe.gain,e?.5:0,e?1.2:.6))}var xe=(e,t,o=.6)=>{let n=le.currentTime;e.cancelScheduledValues(n),e.setValueAtTime(e.value,n),e.linearRampToValueAtTime(t,n+o)};function ba(e=.5){if(!le||!Qt)return;let t=le.currentTime,o=le.createBufferSource();o.buffer=An(le,3);let n=le.createBiquadFilter();n.type="lowpass",n.frequency.setValueAtTime(700-e*480,t),n.Q.value=.5;let s=le.createGain(),d=.55*(1-e*.65);s.gain.setValueAtTime(1e-4,t),s.gain.exponentialRampToValueAtTime(Math.max(.02,d),t+.04+e*.3),s.gain.exponentialRampToValueAtTime(1e-4,t+1.6+e*2.4),o.connect(n).connect(s).connect(qe),o.start(t),o.stop(t+4.2)}function Dn(e){if(!le||!Qt||!Pe)return;let t=e.frame();if(!t)return;let o=t.wx.kind,n=Math.min(1,Math.max((t.precip??0)/.1,o==="rain"||o==="storm"?t.wx.intensity*.5:0)),s=Math.min(1,(t.wind??0)/32),d=Math.min(1,((t.gust??t.wind??0)-(t.wind??0))/18);xe(Pe.rain.gain.gain,n*.3,.9),xe(Pe.rain.filt.frequency,900+n*1500,.9),xe(Pe.patter.gain.gain,n*n*.1,.9),xe(Pe.wind.gain.gain,s*.24,1.1),xe(Pe.wind.filt.Q,1.2+d*2.5,1.1),Pe.lfo.frequency.value=.05+d*.22,Pe.lfoGain.gain.value=120+d*420;let v=t.temp??60,g=44+Math.max(0,Math.min(1,(v-20)/80))*26;for(let i of Pe.drone.oscs)i.frequency.setTargetAtTime(g,le.currentTime,1.5);xe(Pe.drone.gain.gain,.055+(t.sun.altDeg>0?.02:.05),2),xe(Pe.drone.filt.frequency,300+Math.max(0,t.sun.altDeg)*9,2);let y=o==="storm"?.9:Math.min(.6,(t.cape??0)/2500),w=performance.now();y>.15?(St===1/0&&(St=w+Math.random()*6e3),w>St&&(ba(Math.random()*(1-y*.6)),St=w+3e3+Math.random()*22e3*(1.1-y))):St=1/0,wa=y}function Ma(e){let t=e.fmt,o=e.frame(Date.now());if(!o)return[];let n=[],s=o.day,d=Date.now();n.push({tone:"lead",text:`${t.full(d)}. It is ${Y.temp(o.temp)} and ${o.wx.long.toLowerCase()} in ${e.loc.name}`+(Math.abs((o.feels??o.temp)-o.temp)>=3?`, feeling like ${Y.temp(o.feels)}`:"")+"."});for(let h of e.alerts.slice(0,3))n.push({tone:"alert",text:`${h.event} in effect until ${t.weekday(h.expires)} ${t.hm12(h.expires)}.`+(h.instruction?` ${Sa(h.instruction)}`:"")});if(s){let h=e.climate?.doy?.[$a(e,d)],a=`Today runs ${Y.temp(s.tmin)} to ${Y.temp(s.tmax)}`;if(h){let u=s.tmax-h.normalHigh;Math.abs(u)>=3?a+=`, ${Math.abs(u).toFixed(0)}\xB0 ${u>0?"above":"below"} the normal high of ${Y.temp(h.normalHigh)}`:a+=", right about normal",s.tmax>=h.recordHigh&&(a+=`. That would tie or beat the record of ${Y.temp(h.recordHigh)} set in ${h.recordHighYear}`)}n.push({tone:"body",text:a+"."})}let v=bt(e);if(v?.raining)n.push({tone:"wet",text:v.minutes!=null?`It is raining now and should ease within ${v.minutes} minutes.`:"It is raining now, with no break in the next six hours."});else if(v?.minutes!=null&&v.minutes<=240)n.push({tone:"wet",text:`Rain arrives in about ${v.minutes} minutes, around ${t.hm12(v.changeAt)}.`});else{let h=e.hours.find(a=>a.t>d&&(a.pop??0)>=40);h?n.push({tone:"body",text:`Dry for now. The next real chance of rain is ${t.weekday(h.t)} around ${t.hm12(h.t)}, at ${Math.round(h.pop)} percent.`}):n.push({tone:"body",text:"No meaningful rain anywhere in the sixteen-day window."})}let g=Math.max(...e.hours.filter(h=>h.t>d&&h.t<d+24*36e5).map(h=>h.gust??0),0);g>=22&&n.push({tone:"warn",text:`Wind is worth planning around: gusts reach ${Math.round(g)} miles per hour today, ${Dt(g).effect}.`});let y=je(o.dew);["STICKY","HUMID","OPPRESSIVE","MISERABLE","LETHAL"].includes(y.name)?n.push({tone:"warn",text:`The air is ${y.name.toLowerCase()} \u2014 dew point ${Y.temp(o.dew)}, ${y.note}.`}):y.name==="VERY DRY"&&n.push({tone:"body",text:`Very dry air, dew point ${Y.temp(o.dew)}. Expect static and chapped lips.`});let w=s?.uvMax;if(w!=null&&w>=6){let h=Math.round(350/(w*15));n.push({tone:"warn",text:`UV peaks at ${w.toFixed(1)}, ${Ve(w).name.toLowerCase()}. Unprotected skin burns in roughly ${h} minutes.`})}let i=o.air?.aqi??e.airNow?.aqi;i!=null&&i>75&&n.push({tone:"warn",text:`Air quality is ${Be(i).name.toLowerCase()} at ${Math.round(i)} on the US index.`});let c=e.pollen;if(c?.index!=null&&c.index>=7){let h=(c.triggers||[]).map(a=>a.name).slice(0,3).join(", ");n.push({tone:"warn",text:`Pollen is ${vt(c.index).name.toLowerCase().replace("-"," to ")} at ${c.index.toFixed(1)} of 12${h?`, driven by ${h}`:""}.`})}let M=Wt.map(h=>({k:h,w:qt(h,e,{hours:24,limit:1,minScore:62})[0]})).filter(h=>h.w).sort((h,a)=>a.w.peak-h.w.peak).slice(0,2);for(let h of M){let a=Ut(h.k);n.push({tone:"good",text:`Best window to ${a.label.toLowerCase()}: ${t.weekday(h.w.start)} ${t.hm12(h.w.start)} to ${t.hm12(h.w.end)}, scoring ${h.w.peak} out of 100.`})}let f=e.currentKp();if(f!=null&&f>=5){let h=Ct(f);n.push({tone:"space",text:`Geomagnetic activity is elevated: Kp ${f.toFixed(1)}, ${h.name}. Aurora may be visible to about ${h.lat} degrees latitude.`})}let l=e.sunTimesFor(d);return n.push({tone:"body",text:`Sunset is at ${t.hm12(l.sunset)}, with golden hour beginning ${t.hm12(l.goldenHour)}`+(s?.daylight?` and ${rt(s.daylight)} of daylight today`:"")+"."}),n}var Sa=e=>{let t=String(e).replace(/\s+/g," ").match(/^.{0,180}?[.!?](\s|$)/);return(t?t[0]:String(e).slice(0,180)).trim()};function $a(e,t){let[,o,n]=e.fmt.isoDate(t).split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][o-1]+n-1}var ka={lead:"var(--cy)",alert:"var(--rd)",warn:"var(--am)",wet:"var(--ice)",good:"var(--lm)",space:"var(--vi)",body:"var(--ink)"};function po(e,t){let o=Ma(e);t(`
    <div class="hd">BRIEFING<span class="rule"></span>
      <span class="val">${oe(e.loc.name.toUpperCase())} \xB7 ${e.fmt.hm(Date.now())}</span></div>
    <div class="res-list" style="max-height:60vh">
      ${o.map((n,s)=>`
        <p style="
          margin:0 0 10px;
          font-size:${s===0?".92rem":".8rem"};
          line-height:1.6;
          color:${ka[n.tone]||"var(--ink)"};
          ${n.tone==="alert"?"border-left:2px solid var(--rd);padding-left:10px;":""}
          ${s===0?"font-weight:600;":""}
        ">${oe(n.text)}</p>`).join("")}
    </div>
    <div style="display:flex;gap:6px;margin-top:12px">
      <button class="tl-btn" id="speakBtn">\u25B6 SPEAK</button>
      <button class="tl-btn" id="stopBtn">\u25A0 STOP</button>
    </div>
  `,n=>{let s=()=>{if(!window.speechSynthesis)return;speechSynthesis.cancel();let d=o.map(y=>y.text).join(" "),v=new SpeechSynthesisUtterance(d);v.rate=1.02,v.pitch=.85;let g=speechSynthesis.getVoices().find(y=>/en[-_](GB|US)/.test(y.lang)&&y.localService);g&&(v.voice=g),speechSynthesis.speak(v)};n.querySelector("#speakBtn").addEventListener("click",s),n.querySelector("#stopBtn").addEventListener("click",()=>speechSynthesis?.cancel()),e.settings.voice&&setTimeout(s,220)})}function In(e,t,o){let n=t.ownerDocument,s='a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]',d=null,v=!1,g=()=>[...t.querySelectorAll(s)].filter(f=>f.tabIndex>=0&&!f.matches(":disabled")&&!f.closest("[hidden], [inert]")&&f.getClientRects().length&&n.defaultView.getComputedStyle(f).visibility!=="hidden").sort((f,l)=>(f.tabIndex||1/0)-(l.tabIndex||1/0)),y=()=>(g()[0]||t).focus();function w(f){!e.hidden&&!t.contains(f.target)&&y()}function i(f){if(e.hidden||f.defaultPrevented||f.isComposing)return;if(f.key==="Escape"){f.preventDefault(),f.stopPropagation(),M();return}if(f.key!=="Tab"||f.ctrlKey||f.metaKey||f.altKey)return;let l=g(),h=l[0],a=l.at(-1);h?(!l.includes(n.activeElement)||(f.shiftKey?n.activeElement===h:n.activeElement===a))&&(f.preventDefault(),(f.shiftKey?a:h).focus()):(f.preventDefault(),t.focus({preventScroll:!0}))}function c(f,l,h){e.hidden&&(d=h||n.activeElement,v=o?.inert||!1,o&&(o.inert=!0),n.addEventListener("keydown",i,!0),n.addEventListener("focusin",w)),t.innerHTML=f;let a=t.querySelector(".hd");a?(a.id||="modalTitle",t.setAttribute("aria-labelledby",a.id),t.removeAttribute("aria-label")):(t.removeAttribute("aria-labelledby"),t.setAttribute("aria-label","Weather dialog")),e.hidden=!1,e.scrollTop=t.scrollTop=0,l&&l(t),t.contains(n.activeElement)||y()}function M(){if(e.hidden)return;e.hidden=!0,n.removeEventListener("keydown",i,!0),n.removeEventListener("focusin",w),t.innerHTML="",o&&(o.inert=v);let f=d;d=null,f?.isConnected&&!f.closest("[inert]")&&f.focus({preventScroll:!0})}return e.addEventListener("click",f=>{f.target===e&&M()}),{open:c,close:M}}var yo=["deck","radar","sky","air","data","overhead"],Ta=5*6e4,ue={sky:document.getElementById("sky"),boot:document.getElementById("boot"),bootLog:document.getElementById("bootLog"),led:document.getElementById("led"),locBtn:document.getElementById("locBtn"),locName:document.getElementById("locName"),locSub:document.getElementById("locSub"),nav:document.getElementById("nav"),clockTime:document.getElementById("clockTime"),clockZone:document.getElementById("clockZone"),alertBtn:document.getElementById("alertBtn"),soundBtn:document.getElementById("soundBtn"),briefBtn:document.getElementById("briefBtn"),cfgBtn:document.getElementById("cfgBtn"),scrub:document.getElementById("scrub"),modal:document.getElementById("modal"),modalCard:document.getElementById("modalCard")},Ze=new Rt(ue.sky),Hn=null,Fe={},Fn=In(ue.modal,ue.modalCard,document.getElementById("app")),Pn=[];function Ee(e,t=""){Pn.push(t?`<span class="${t}">${e}</span>`:e),ue.bootLog.innerHTML=Pn.join(`
`)}async function Ea(){Ee("ATMOS//NET v1.0.0"),Ee('<span class="mut">initialising atmospheric console\u2026</span>'),Ho();let e=new URLSearchParams(location.search).get("q");e!==null&&/^[0-3]$/.test(e)&&co(+e),Ee(`render tier ${ae.tier} \xB7 ${ae.onBattery?"battery":"AC power"}`,"ok");let t=Ze.init();Ze.setQuality(ae.tier),Ee(t?"webgl2 sky renderer online":"webgl2 unavailable \u2014 sky disabled",t?"ok":"err"),ae.onChange(d=>Ze.setQuality(d));let o=r.loc,n=null;o?Ee(`location: ${oe(o.name)}`):(n=await ce.config(),o=n.home,Ee(`no saved location \u2014 using ${oe(o.name)}`)),Ee('<span class="mut">contacting feeds\u2026</span>'),await r.setLocation(o,{remember:!n?.public});let s=r.raw;Ee(`open-meteo forecast  ${s?.forecast?.ok?"OK":"FAIL"}`,s?.forecast?.ok?"ok":"err"),Ee(`open-meteo air       ${s?.air?.ok?"OK":"FAIL"}`,s?.air?.ok?"ok":"err"),Ee(`nws alerts           ${s?.alerts?.ok?"OK":"FAIL"}`,s?.alerts?.ok?"ok":"err"),Ee(`noaa swpc space wx   ${s?.space?.ok?"OK":"FAIL"}`,s?.space?.ok?"ok":"err"),Ee(`${r.hours.length} hourly steps \xB7 ${r.days.length} days \xB7 ${r.min15.length} 15-min steps`,"ok"),Aa(),Ee("console ready","ok"),setTimeout(()=>{ue.boot.classList.add("done");let d=r.skyParams();d&&Ze.snap(d)},0),zn(),setInterval(()=>{document.hidden||r.refresh()},Ta),Da(n)}function On(e,t,o){Object.defineProperty(Fe,e,{configurable:!0,enumerable:!0,get(){let n=t(document.getElementById(o));return Object.defineProperty(Fe,e,{value:n,configurable:!0,enumerable:!0,writable:!0}),n}})}function Aa(){Hn=xo(ue.scrub),Fe.deck=dn(document.getElementById("view-deck")),Fe.sky=vn(document.getElementById("view-sky")),Fe.air=wn(document.getElementById("view-air")),Fe.data=bn(document.getElementById("view-data")),On("radar",hn,"view-radar"),On("overhead",En,"view-overhead");let e=()=>{let o=Fe[r.view];o?.update&&o.update()};r.on("data",()=>{e(),go()}),r.on("cursor",()=>{e(),kt()}),r.on("climate",e),r.on("models",e),r.on("pollen",e),r.on("observed",e),r.on("radar",e),r.on("loc",go),r.on("status",o=>{ue.led.dataset.state=o==="ok"?"":o}),ue.nav.addEventListener("click",o=>{let n=o.target.closest("button[data-view]");n&&$t(n.dataset.view)}),ue.locBtn.addEventListener("click",_n),ue.alertBtn.addEventListener("click",Bn),ue.briefBtn.addEventListener("click",()=>po(r,pt)),ue.cfgBtn.addEventListener("click",Wn),ue.soundBtn.addEventListener("click",wo),document.addEventListener("visibilitychange",()=>{document.hidden||(Xt=0,r.syncToNow())}),window.addEventListener("resize",()=>{Ze.resize()}),document.addEventListener("keydown",Ia),window.addEventListener("hashchange",()=>$t(location.hash.slice(1),{push:!1}));let t=location.hash.slice(1);yo.includes(t)&&t!=="deck"?$t(t):document.documentElement.style.setProperty("--stage-dim","0.25"),go(),e()}function go(){let e=r.loc;e&&(ue.locName.textContent=e.name,ue.locSub.textContent=[e.admin1,e.country].filter(Boolean).join(" \xB7 ")||`${e.lat.toFixed(2)}, ${e.lon.toFixed(2)}`),ue.clockZone.textContent=r.tz.split("/").pop().replace(/_/g," "),ue.alertBtn.dataset.n=String(r.alerts.length),ue.soundBtn.classList.toggle("on",it())}function $t(e,{push:t=!0}={}){if(!yo.includes(e)||r.view===e)return;Fe[r.view]?.onHide?.(),r.view=e,Wo();let o=Fe[e];t&&location.hash.slice(1)!==e&&history.replaceState(null,"","#"+e);for(let n of ue.nav.querySelectorAll("button"))n.setAttribute("aria-selected",String(n.dataset.view===e));for(let n of document.querySelectorAll(".view"))n.classList.toggle("active",n.dataset.view===e);document.documentElement.style.setProperty("--stage-dim",e==="deck"?"0.25":"0.72"),o?.update&&o.update(),o?.onShow&&o.onShow()}var Rn=performance.now(),vo=0,Xt=0,La=20;function zn(e=performance.now()){requestAnimationFrame(zn);let t=Math.min(.1,(e-Rn)/1e3);Rn=e,No(t),document.hidden||(Ze.render(e,t),Hn?.tick(t),Xt+=t,Xt>La&&(Xt=0,r.syncToNow()),vo+=t,(r.playing||vo>.25)&&(vo=0,kt()),Ca(e),Dn(r))}function kt(){let e=r.skyParams();e&&Ze.set(e)}var Nn=0;function Ca(e){e-Nn<500||(Nn=e,ue.clockTime.textContent=r.fmt.hms(Date.now()))}function pt(e,t,o){Fn.open(e,t,o)}function eo(){Fn.close()}function _n(){pt(`
    <div class="hd">LOCATION<span class="rule"></span><span class="val">ENTER TO SELECT \xB7 ESC TO CLOSE</span></div>
    <input class="search-input" id="q" placeholder="search any city, or paste  lat, lon" autocomplete="off" spellcheck="false">
    <button class="tl-btn" id="useloc" style="margin-top:8px">\u25CE USE MY LOCATION</button>
    <div class="res-list" id="res"></div>
  `,e=>{let t=e.querySelector("#q"),o=e.querySelector("#res"),n=[],s=0,d=null,v=()=>{n=r.favorites.map(i=>({...i,fav:!0})),g("SAVED")},g=i=>{if(!n.length){o.innerHTML=`<h3>${i}</h3><div class="nodata">no results</div>`;return}o.innerHTML=`<h3>${i}</h3>`+n.map((c,M)=>`
        <div class="res-item ${M===s?"sel":""}" data-i="${M}">
          <div>
            <b>${mt(c.name)}</b><br>
            <span>${mt([c.admin1,c.country||c.country_code].filter(Boolean).join(" \xB7 "))}</span>
          </div>
          <span class="coord">${(+c.latitude).toFixed(2)}, ${(+c.longitude).toFixed(2)}</span>
          ${c.fav?`<button class="rm" data-rm="${M}" title="Remove">\xD7</button>`:""}
        </div>`).join("")},y=async i=>{let c=n[i];c&&(r.addFavorite(c),eo(),await r.setLocation(c),kt())};o.addEventListener("click",i=>{let c=i.target.closest("[data-rm]");if(c){i.stopPropagation(),r.removeFavorite(+c.dataset.rm),v();return}let M=i.target.closest("[data-i]");M&&y(+M.dataset.i)}),t.addEventListener("input",()=>{clearTimeout(d);let i=t.value.trim();if(!i){v();return}let c=i.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);if(c){let M=+c[1],f=+c[2];if(Math.abs(M)<=90&&Math.abs(f)<=180){n=[{name:`${M.toFixed(4)}, ${f.toFixed(4)}`,admin1:"coordinate",latitude:M,longitude:f}],s=0,g("COORDINATE");return}}d=setTimeout(async()=>{try{n=(await ce.geocode(i)).results||[],s=0,g("RESULTS")}catch{n=[],g("RESULTS")}},220)}),t.addEventListener("keydown",i=>{i.key==="ArrowDown"?(s=Math.min(n.length-1,s+1),g(o.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="ArrowUp"?(s=Math.max(0,s-1),g(o.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="Enter"&&(y(s),i.preventDefault())});let w=e.querySelector("#useloc");!navigator.geolocation||!window.isSecureContext?w.remove():w.addEventListener("click",()=>{w.textContent="\u25CE LOCATING\u2026",navigator.geolocation.getCurrentPosition(async i=>{let c=i.coords.latitude,M=i.coords.longitude,f=`${c.toFixed(2)}, ${M.toFixed(2)}`,l="",h="";try{let a=await ce.reverse(c,M);f=a.city||a.locality||a.principalSubdivision||f,l=a.principalSubdivision||"",h=a.countryCode||""}catch{}r.settings.geo="set",eo(),await r.setLocation({name:f,admin1:l,country_code:h,latitude:c,longitude:M}),kt()},i=>{w.textContent=i.code===i.PERMISSION_DENIED?"\u25CE LOCATION BLOCKED IN BROWSER":"\u25CE LOCATION UNAVAILABLE"},{timeout:8e3,maximumAge:30*6e4})}),v(),t.focus()})}function Bn(){let e=r.alerts;if(!e.length){pt(`<div class="hd">ALERTS<span class="rule"></span></div>
      <div class="nodata">no active watches, warnings or advisories for this location</div>`);return}pt(`
    <div class="hd" style="--ac:var(--rd)">ACTIVE ALERTS<span class="rule"></span><span class="val">${e.length}</span></div>
    <div class="res-list">
      ${e.map(t=>`
        <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)">
          <b style="color:#f47171;font-size:.82rem;letter-spacing:.08em">${mt(t.event)}</b>
          <div style="font-family:var(--mono);font-size:max(.6rem,var(--fs-floor,0px));color:var(--faint);margin:3px 0 6px">
            ${mt(t.senderName||"")} \xB7 until ${r.fmt.weekday(t.expires)} ${r.fmt.hm(t.expires)}
          </div>
          <div style="font-size:max(.72rem,var(--fs-floor,0px));color:var(--dim);line-height:1.5;white-space:pre-wrap">${mt((t.description||"").slice(0,900))}</div>
          ${t.instruction?`<div style="margin-top:7px;font-size:max(.7rem,var(--fs-floor,0px));color:var(--am);line-height:1.5">${mt(t.instruction.slice(0,400))}</div>`:""}
        </div>`).join("")}
    </div>
  `)}function Wn(e){let t=ae.manual;pt(`
    <div class="hd">SETTINGS<span class="rule"></span><span class="val">ATMOS//NET v1.0.0</span></div>
    <div class="setrow">
      <label>Render quality<span class="hint">Auto adapts to power state and measured frame rate</span></label>
      <div class="seg" id="qseg">
        ${["auto","0","1","2","3"].map(o=>`<button data-q="${o}" class="${String(t)===o||t==null&&o==="auto"?"on":""}">${o}</button>`).join("")}
      </div>
    </div>
    <div class="setrow">
      <label>Ambient audio<span class="hint">Generative soundscape matched to live conditions</span></label>
      <div class="seg"><button id="sndT" class="${it()?"on":""}">${it()?"on":"off"}</button></div>
    </div>
    <div class="setrow">
      <label>Spoken briefing<span class="hint">Reads the briefing aloud when opened</span></label>
      <div class="seg"><button id="voiceT" class="${r.settings.voice?"on":""}">${r.settings.voice?"on":"off"}</button></div>
    </div>
    <h3>Keyboard</h3>
    <div class="keyhelp">
      ${[["1\u20135","switch view"],["Space","play / pause forecast"],["\u2190 \u2192","step 1 hour"],["Shift \u2190 \u2192","step 6 hours"],["N","return to now"],["/","search location"],["A","alerts"],["B","briefing"],["S","ambient audio"],["F","fullscreen"],[",","settings"],["Esc","close"]].map(([o,n])=>`<div><span>${n}</span><kbd>${o}</kbd></div>`).join("")}
    </div>
    <h3>Data sources</h3>
    <div style="font-size:max(.66rem,var(--fs-floor,0px));color:var(--dim);line-height:1.7">
      Open-Meteo (forecast \xB7 air quality \xB7 1994\u2013 archive \xB7 multi-model ensemble) \xB7
      NWS api.weather.gov (US alerts) \xB7 RainViewer (radar) \xB7
      NOAA SWPC (space weather) \xB7 pollen.com (US pollen) \xB7 Esri (map tiles)
    </div>
  `,o=>{o.querySelector("#qseg").addEventListener("click",n=>{let s=n.target.closest("[data-q]");s&&(co(s.dataset.q==="auto"?null:+s.dataset.q),o.querySelectorAll("[data-q]").forEach(d=>d.classList.toggle("on",d===s)))}),o.querySelector("#sndT").addEventListener("click",n=>{wo(),n.target.textContent=it()?"on":"off",n.target.classList.toggle("on",it())}),o.querySelector("#voiceT").addEventListener("click",n=>{r.settings.voice=!r.settings.voice,r.save(),n.target.textContent=r.settings.voice?"on":"off",n.target.classList.toggle("on",r.settings.voice)})},e?.currentTarget)}function wo(){let e=!it();Ln(),Cn(e),r.settings.sound=e,r.save(),ue.soundBtn.classList.toggle("on",e)}function Da(e){e?.public&&(r.settings.geo||!navigator.geolocation||!window.isSecureContext||navigator.geolocation.getCurrentPosition(async t=>{let o=t.coords.latitude,n=t.coords.longitude,s=`${o.toFixed(2)}, ${n.toFixed(2)}`,d="",v="";try{let g=await ce.reverse(o,n);s=g.city||g.locality||g.principalSubdivision||s,d=g.principalSubdivision||"",v=g.countryCode||""}catch{}r.settings.geo="set",await r.setLocation({name:s,admin1:d,country_code:v,latitude:o,longitude:n}),kt()},t=>{t.code===t.PERMISSION_DENIED&&(r.settings.geo="denied",r.save())},{timeout:8e3,maximumAge:30*6e4,enableHighAccuracy:!1}))}function Ia(e){if(e.defaultPrevented||e.isComposing)return;if(e.target.closest?.('input, textarea, select, button, a[href], summary, [contenteditable], [role="button"], [role="link"], [role="slider"], [role="textbox"], [role="combobox"]')){e.key==="Escape"&&eo();return}if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest?.('[aria-modal="true"]'))return;let t=e.key;if(t==="Escape"){eo();return}if(t>="1"&&t<="6"){$t(yo[+t-1]);return}switch(t.toLowerCase()){case" ":r.playing=!r.playing,r.playing&&r.view!=="radar"&&(r.following=!1),r.playing&&r.cursor>=r.span.hi-6e4&&r.setCursor(Date.now()),r.emit("play",r.playing),e.preventDefault();break;case"arrowleft":r.playing=!1,r.scrubTo(r.cursor-(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"arrowright":r.playing=!1,r.scrubTo(r.cursor+(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"n":r.toNow();break;case"/":_n(),e.preventDefault();break;case"a":Bn();break;case"b":po(r,pt);break;case"s":wo();break;case",":Wn();break;case"r":r.refresh();break;case"f":document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();break;default:break}}var mt=oe;Ea().catch(e=>{console.error(e),Ee(`FATAL: ${e.message}`,"err")});window.ATMOS={store:r,sky:Ze,perf:ae,setView:$t,views:Fe};export{eo as closeModal,pt as openModal};
