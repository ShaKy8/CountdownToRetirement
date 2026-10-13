import{a as xe,b as He,c as Fe,d as $t,e as ft,f as Ze,g as Je,h as bo,i as Mo,j as Ie,k as kt}from"./chunk.7JX7BFLW.js";var Fn=new URL("./",location.href);async function we(e,t){let o=new URL(e.replace(/^\//,""),Fn);for(let[s,l]of Object.entries(t||{}))l!=null&&o.searchParams.set(s,l);let n=await fetch(o,{cache:"no-store"});if(!n.ok)throw new Error(`${e} -> ${n.status}`);return n.json()}var ce={config:()=>we("/api/config"),bundle:(e,t)=>we("/api/bundle",{lat:e,lon:t}),climate:(e,t)=>we("/api/climate",{lat:e,lon:t}),models:(e,t)=>we("/api/models",{lat:e,lon:t}),pollen:(e,t)=>we("/api/pollen",{lat:e,lon:t}),observations:(e,t)=>we("/api/observations",{lat:e,lon:t}),radar:()=>we("/api/radar"),space:()=>we("/api/space"),aurora:()=>we("/api/aurora"),iss:()=>we("/api/iss"),aircraft:(e,t,o)=>we("/api/aircraft",{lat:e,lon:t,dist:o}),flight:(e,t)=>we("/api/flight",{cs:e,hex:t}),elsewhere:e=>we("/api/elsewhere",{q:e}),geocode:e=>we("/api/geocode",{q:e}),reverse:(e,t)=>we("/api/reverse",{lat:e,lon:t})};var zn={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"},te=e=>String(e??"").replace(/[<>&"']/g,t=>zn[t]),N=(e,t,o)=>Math.min(o,Math.max(t,e)),Tt=(e,t,o)=>e+(t-e)*o;var Z={temp:e=>e==null?"--":`${Math.round(e)}\xB0`,tempP:e=>e==null?"--":`${e.toFixed(1)}\xB0`,pct:e=>e==null?"--":`${Math.round(e)}%`,wind:e=>e==null?"--":`${Math.round(e)}`,pressure:e=>e==null?"--":(e*.029529983071445).toFixed(2),inches:e=>e==null?"--":e<.01&&e>0?"<0.01":e.toFixed(2),miles:e=>e==null?"--":e>=1609*9?"10+":(e/1609.344).toFixed(1),int:e=>e==null?"--":String(Math.round(e)),signed:(e,t=1)=>e==null?"--":`${e>=0?"+":"\u2212"}${Math.abs(e).toFixed(t)}`},Bn=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"],me=e=>e==null?"--":Bn[Math.round((e%360+360)%360/22.5)%16];function at(e){if(e==null)return"--";let t=Math.floor(e/3600),o=Math.round(e%3600/60);return t?`${t}h ${String(o).padStart(2,"0")}m`:`${o}m`}function Xt(e){let t=e-Date.now(),o=Math.abs(t),n=Math.round(o/6e4);if(n<1)return"now";let s=n<60?`${n} min`:`${Math.floor(n/60)}h ${String(n%60).padStart(2,"0")}m`;return t>0?`in ${s}`:`${s} ago`}var So={0:["CLEAR","Clear sky","clear",0],1:["MAINLY CLEAR","Mainly clear","clear",0],2:["PARTLY CLOUDED","Partly cloudy","cloud",.4],3:["OVERCAST","Overcast","cloud",1],45:["FOG","Fog","fog",.7],48:["RIME FOG","Depositing rime fog","fog",1],51:["LIGHT DRIZZLE","Light drizzle","rain",.2],53:["DRIZZLE","Moderate drizzle","rain",.35],55:["DENSE DRIZZLE","Dense drizzle","rain",.5],56:["FREEZING DRIZZLE","Light freezing drizzle","rain",.3],57:["FREEZING DRIZZLE+","Dense freezing drizzle","rain",.5],61:["LIGHT RAIN","Slight rain","rain",.35],63:["RAIN","Moderate rain","rain",.6],65:["HEAVY RAIN","Heavy rain","rain",1],66:["FREEZING RAIN","Light freezing rain","rain",.5],67:["FREEZING RAIN+","Heavy freezing rain","rain",.9],71:["LIGHT SNOW","Slight snow fall","snow",.3],73:["SNOW","Moderate snow fall","snow",.6],75:["HEAVY SNOW","Heavy snow fall","snow",1],77:["SNOW GRAINS","Snow grains","snow",.3],80:["RAIN SHOWERS","Slight rain showers","rain",.45],81:["RAIN SHOWERS","Moderate rain showers","rain",.7],82:["VIOLENT SHOWERS","Violent rain showers","rain",1],85:["SNOW SHOWERS","Slight snow showers","snow",.5],86:["HEAVY SNOW SHOWERS","Heavy snow showers","snow",1],95:["THUNDERSTORM","Thunderstorm","storm",.7],96:["T-STORM + HAIL","Thunderstorm with slight hail","storm",.85],99:["SEVERE T-STORM","Thunderstorm with heavy hail","storm",1]};function Qe(e){let t=So[e]||So[0];return{code:e,label:t[0],long:t[1],kind:t[2],intensity:t[3]}}function eo(e,t=!0){let o=Qe(e).kind;return o==="clear"?e===0?t?"\u2600":"\u263E":t?"\u26C5":"\u2601":o==="cloud"?e===3?"\u2601":t?"\u26C5":"\u2601":o==="fog"?"\u2591":o==="rain"?"\u2614":o==="snow"?"\u2744":o==="storm"?"\u26A1":"\u25CB"}function ze(e){return e==null?{name:"NO DATA",color:"#8d9aab",level:0}:e<=50?{name:"GOOD",color:"#8fdc6a",level:1}:e<=100?{name:"MODERATE",color:"#ecd46a",level:2}:e<=150?{name:"SENSITIVE GROUPS",color:"#f59a5b",level:3}:e<=200?{name:"UNHEALTHY",color:"#f47171",level:4}:e<=300?{name:"VERY UNHEALTHY",color:"#c89af5",level:5}:{name:"HAZARDOUS",color:"#ef5a6a",level:6}}function Ge(e){return e==null?{name:"NO DATA",color:"#8d9aab"}:e<3?{name:"LOW",color:"#8fdc6a"}:e<6?{name:"MODERATE",color:"#ecd46a"}:e<8?{name:"HIGH",color:"#f59a5b"}:e<11?{name:"VERY HIGH",color:"#f47171"}:{name:"EXTREME",color:"#c89af5"}}var $o=[null,200,250,300,450,600,1e3];function Et(e,t=3){if(!e||e<=.1)return null;let o=$o[t]??$o[3];return Math.round(o/(e*1.5))}function mt(e){return e==null?{name:"NO DATA",color:"#8d9aab"}:e<2.5?{name:"LOW",color:"#8fdc6a"}:e<4.9?{name:"LOW-MED",color:"#c6dc6e"}:e<7.3?{name:"MEDIUM",color:"#ecd46a"}:e<9.7?{name:"MED-HIGH",color:"#f59a5b"}:{name:"HIGH",color:"#f47171"}}function At(e){return e==null?{name:"NO DATA",color:"#8d9aab",lat:null}:e<3?{name:"QUIET",color:"#6bb3bd",lat:66}:e<4?{name:"UNSETTLED",color:"#3fd0d8",lat:63}:e<5?{name:"ACTIVE",color:"#8fdc6a",lat:60}:e<6?{name:"G1 STORM",color:"#ecd46a",lat:56}:e<7?{name:"G2 STORM",color:"#f59a5b",lat:53}:e<8?{name:"G3 STORM",color:"#f47171",lat:50}:e<9?{name:"G4 STORM",color:"#c89af5",lat:47}:{name:"G5 EXTREME",color:"#ef5a6a",lat:42}}function Lt(e){return e==null?{name:"--",effect:""}:e<1?{name:"CALM",effect:"smoke rises vertically"}:e<4?{name:"LIGHT AIR",effect:"smoke drifts"}:e<8?{name:"LIGHT BREEZE",effect:"leaves rustle"}:e<13?{name:"GENTLE BREEZE",effect:"flags extend"}:e<19?{name:"MODERATE",effect:"dust and paper lift"}:e<25?{name:"FRESH BREEZE",effect:"small trees sway"}:e<32?{name:"STRONG BREEZE",effect:"umbrellas fail"}:e<39?{name:"NEAR GALE",effect:"walking is work"}:e<47?{name:"GALE",effect:"twigs break off"}:e<55?{name:"STRONG GALE",effect:"shingles lift"}:e<64?{name:"STORM",effect:"trees uprooted"}:e<73?{name:"VIOLENT STORM",effect:"widespread damage"}:{name:"HURRICANE",effect:"devastation"}}function qe(e){return e==null?{name:"--",color:"#8d9aab",note:""}:e<30?{name:"VERY DRY",color:"#7fb2f0",note:"static, chapped lips"}:e<45?{name:"DRY",color:"#3fd0d8",note:"crisp and comfortable"}:e<55?{name:"COMFORTABLE",color:"#8fdc6a",note:"ideal"}:e<60?{name:"STICKY",color:"#c6dc6e",note:"noticeable humidity"}:e<65?{name:"HUMID",color:"#ecd46a",note:"uncomfortable"}:e<70?{name:"OPPRESSIVE",color:"#f59a5b",note:"sweat does not evaporate"}:e<75?{name:"MISERABLE",color:"#f47171",note:"dangerous for exertion"}:{name:"LETHAL",color:"#ef5a6a",note:"limit outdoor exposure"}}function pt(e="",t=""){let o=e.toLowerCase();return/tornado|hurricane|extreme|tsunami/.test(o)?"#ef5a6a":/warning/.test(o)?"#f47171":/watch/.test(o)?"#f59a5b":/advisory|statement/.test(o)?"#ecd46a":t==="Extreme"||t==="Severe"?"#f47171":"#3fd0d8"}function Ct(e){let t=u=>new Intl.DateTimeFormat("en-US",{timeZone:e,...u}),o=t({hour:"2-digit",minute:"2-digit",hour12:!1}),n=t({hour:"numeric",minute:"2-digit",hour12:!0}),s=t({hour:"numeric",hour12:!0}),l=t({weekday:"short"}),w=t({month:"short",day:"numeric"}),y=t({weekday:"long",month:"long",day:"numeric"}),S=t({hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),v=u=>{if(u==null)return null;let d=new Date(u);return Number.isNaN(+d)?null:d},i=u=>d=>{let p=v(d);return p?u.format(p):"--"},f=new Intl.DateTimeFormat("en-CA",{timeZone:e}),k=new Intl.DateTimeFormat("en-US",{timeZone:e,hour:"numeric",minute:"numeric",hour12:!1});return{hm:i(o),hm12:i(n),hour:i(s),weekday:i(l),monthDay:i(w),full:i(y),hms:i(S),isoDate:u=>{let d=v(u);return d?f.format(d):"--"},hourOfDay:u=>{let d=v(u);if(!d)return NaN;let p=k.formatToParts(d),a=c=>+p.find(h=>h.type===c)?.value;return a("hour")%24+a("minute")/60}}}function ko(e,t){let o=new Date(e);if(Number.isNaN(+o))return NaN;let n=new Intl.DateTimeFormat("en-CA",{timeZone:t}).format(o),[,s,l]=n.split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][s-1]+l-1}var To="atmos.v1";function oo(e,t){if(!e||typeof e!="object")return null;let o=e.latitude??e.lat,n=e.longitude??e.lon,s=l=>(typeof l=="number"||typeof l=="string"&&l.trim()!=="")&&Number.isFinite(+l);return!s(o)||!s(n)||Math.abs(+o)>90||Math.abs(+n)>180?null:{name:e.name,admin1:e.admin1||"",country:e.country_code||e.country||"",lat:+o,lon:+n,tz:e.timezone||e.tz||t,elevation:e.elevation??null}}function Eo(e){let t=oo(e);return t&&{name:t.name,admin1:t.admin1,country_code:t.country,latitude:t.lat,longitude:t.lon,timezone:t.tz}}var no=e=>typeof e=="string"&&e?`${e.includes("T")?e:`${e}T00:00:00`}Z`:"",Io=e=>t=>Date.parse(no(t))-e*1e3;function Dt(e,t,o){if(!e?.time?.length)return[];let n=Io(t),s=e.time.length,l=new Array(s);for(let w=0;w<s;w++){let y={t:n(e.time[w]),i:w};for(let[S,v]of Object.entries(o))y[S]=e[v]?.[w]??null;l[w]=y}return l}var Ao={temp:"temperature_2m",rh:"relative_humidity_2m",dew:"dew_point_2m",feels:"apparent_temperature",pop:"precipitation_probability",precip:"precipitation",rain:"rain",showers:"showers",snow:"snowfall",snowDepth:"snow_depth",code:"weather_code",pressure:"pressure_msl",surfPressure:"surface_pressure",cloud:"cloud_cover",cloudLow:"cloud_cover_low",cloudMid:"cloud_cover_mid",cloudHigh:"cloud_cover_high",vis:"visibility",vpd:"vapour_pressure_deficit",wind:"wind_speed_10m",windDir:"wind_direction_10m",gust:"wind_gusts_10m",uv:"uv_index",uvClear:"uv_index_clear_sky",isDay:"is_day",sunshine:"sunshine_duration",cape:"cape",li:"lifted_index",cin:"convective_inhibition",freezing:"freezing_level_height",blh:"boundary_layer_height",wetbulb:"wet_bulb_temperature_2m",soilT:"soil_temperature_0cm",soilM:"soil_moisture_0_to_1cm",et0:"et0_fao_evapotranspiration"},_n={code:"weather_code",tmax:"temperature_2m_max",tmin:"temperature_2m_min",feelsMax:"apparent_temperature_max",feelsMin:"apparent_temperature_min",sunriseS:"sunrise",sunsetS:"sunset",daylight:"daylight_duration",sunshine:"sunshine_duration",uvMax:"uv_index_max",precip:"precipitation_sum",rain:"rain_sum",showers:"showers_sum",snow:"snowfall_sum",precipHours:"precipitation_hours",pop:"precipitation_probability_max",windMax:"wind_speed_10m_max",gustMax:"wind_gusts_10m_max",windDir:"wind_direction_10m_dominant",radiation:"shortwave_radiation_sum",et0:"et0_fao_evapotranspiration"},Lo={precip:"precipitation",code:"weather_code",cape:"cape",vis:"visibility",gust:"wind_gusts_10m",isDay:"is_day"},Co={aqi:"us_aqi",pm10:"pm10",pm25:"pm2_5",co:"carbon_monoxide",no2:"nitrogen_dioxide",so2:"sulphur_dioxide",o3:"ozone",aod:"aerosol_optical_depth",dust:"dust",uv:"uv_index",alder:"alder_pollen",birch:"birch_pollen",grass:"grass_pollen",mugwort:"mugwort_pollen",olive:"olive_pollen",ragweed:"ragweed_pollen"},Wn=.3048;function Do(e,t,o){if(!t||!e?.length)return;let n=Object.entries(o).filter(([,s])=>t[s]==="ft").map(([s])=>s);if(n.length)for(let s of e)for(let l of n)s[l]!=null&&(s[l]*=Wn)}var Un=new Set(["code","isDay","i"]);function Gn(e,t,o){if(!e)return t?{...t}:null;if(!t)return{...e};let n={};for(let s in e){let l=e[s],w=t[s];if(Un.has(s)){n[s]=o<.5?l:w;continue}typeof l=="number"&&typeof w=="number"?n[s]=s==="windDir"?((l+(((w-l)%360+540)%360-180)*o)%360+360)%360:Tt(l,w,o):n[s]=l??w}return n}function to(e,t){if(!e?.length)return null;if(t<=e[0].t)return{...e[0]};if(t>=e.at(-1).t)return{...e.at(-1)};let o=e[1].t-e[0].t,n=(t-e[0].t)/o,s=N(Math.floor(n),0,e.length-2);return Gn(e[s],e[s+1],n-s)}var ao=class{constructor(){this.listeners=new Map,this.requestId=0,this.pendingLocation=null,this.pendingRemember=!0,this.loc=null,this.tz=Intl.DateTimeFormat().resolvedOptions().timeZone,this.fmt=Ct(this.tz),this.raw=null,this.hours=[],this.days=[],this.min15=[],this.air=[],this.airNow=null,this.alerts=[],this.space=null,this.climate=null,this.models=null,this.pollen=null,this.radar=null,this.observed=null,this.cursor=Date.now(),this.now=Date.now(),this.following=!0,this.playing=!1,this.playRate=1,this.view="deck",this.status="boot",this.lastFetch=0,this.favorites=[],this.settings={sound:!1,skinType:3,voice:!0},this.restore()}on(t,o){return this.listeners.has(t)||this.listeners.set(t,new Set),this.listeners.get(t).add(o),()=>this.listeners.get(t).delete(o)}emit(t,o){for(let n of this.listeners.get(t)||[])try{n(o)}catch(s){console.error(`[store:${t}]`,s)}}restore(){try{let t=JSON.parse(localStorage.getItem(To)||"{}");t.loc&&(this.loc=oo(t.loc,this.tz)),Array.isArray(t.favorites)&&(this.favorites=t.favorites.map(Eo).filter(Boolean)),t.settings&&Object.assign(this.settings,t.settings)}catch{}}save(){try{localStorage.setItem(To,JSON.stringify({loc:this.loc,favorites:this.favorites,settings:this.settings}))}catch{}}setStatus(t){this.status=t,this.emit("status",t)}async setLocation(t,{remember:o=!0}={}){let n=oo(t,this.tz);n&&(this.pendingLocation=n,this.pendingRemember=o,await this.refresh({full:!0}))}addFavorite(t){let o=s=>`${(+(s.lat??s.latitude)).toFixed(3)},${(+(s.lon??s.longitude)).toFixed(3)}`,n=Eo(t);n&&(this.favorites=this.favorites.filter(s=>o(s)!==o(n)),this.favorites.unshift(n),this.favorites=this.favorites.slice(0,12),this.save(),this.emit("favorites",this.favorites))}removeFavorite(t){this.favorites.splice(t,1),this.save(),this.emit("favorites",this.favorites)}async refresh({full:t=!1}={}){let o=this.pendingLocation||this.loc;if(!o)return;let{lat:n,lon:s}=o,l=this.pendingLocation,w=this.pendingRemember,y=++this.requestId,S=()=>y===this.requestId;t=t||!!l,this.setStatus("load");try{let i=await ce.bundle(n,s);if(!S())return;if(!i.forecast?.ok||!Array.isArray(i.forecast.data?.hourly?.time)||!i.forecast.data.hourly.time.length)throw new Error(`Forecast unavailable for ${o.name||"this location"}`);let f=i.forecast.data.timezone||o.tz,k=Ct(f),u={loc:{...o,tz:f},tz:f,fmt:k,following:this.following,cursor:this.cursor};this.ingest.call(u,i),(!this.loc||this.loc.lat!==n||this.loc.lon!==s)&&(this.climate=this.models=this.pollen=this.observed=this.radar=null),Object.assign(this,u),this.pendingLocation=null,l&&w&&this.save(),this.lastFetch=Date.now(),this.setStatus("ok"),l&&this.emit("loc",this.loc),this.emit("data",this)}catch(i){if(!S())return;console.error("[store] bundle failed",i),this.setStatus("err"),this.emit("error",i);return}let v=[ce.radar().then(i=>{S()&&(this.radar=i,this.emit("radar",i))}),ce.pollen(n,s).then(i=>{S()&&(this.pollen=i,this.emit("pollen",i))}),ce.observations(n,s).then(i=>{S()&&(this.observed=i,this.emit("observed",i))})];(t||!this.climate)&&v.push(ce.climate(n,s).then(i=>{S()&&(this.climate=i,this.emit("climate",i))})),(t||!this.models)&&v.push(ce.models(n,s).then(i=>{S()&&(this.models=this.reduceModels(i),this.emit("models",this.models))})),await Promise.allSettled(v),S()&&this.emit("data",this)}ingest(t){this.raw=t;let o=t.forecast?.ok?t.forecast.data:null;if(o){let s=o.utc_offset_seconds??0;this.utcOffset=s,this.elevation=o.elevation,o.timezone&&o.timezone!==this.tz&&(this.tz=o.timezone,this.fmt=Ct(this.tz),this.loc&&(this.loc.tz=o.timezone)),this.hours=Dt(o.hourly,s,Ao),this.min15=Dt(o.minutely_15,s,Lo),Do(this.hours,o.hourly_units,Ao),Do(this.min15,o.minutely_15_units,Lo),this.days=Dt(o.daily,s,_n).map(l=>({...l,sunrise:l.sunriseS?Date.parse(no(l.sunriseS))-s*1e3:null,sunset:l.sunsetS?Date.parse(no(l.sunsetS))-s*1e3:null}))}let n=t.air?.ok?t.air.data:null;if(this.air=[],this.airNow=null,n&&(this.air=Dt(n.hourly,n.utc_offset_seconds??0,Co),this.airNow=n.current?Object.fromEntries(Object.entries(Co).map(([s,l])=>[s,n.current[l]??null])):null),this.alerts=t.alerts?.ok&&Array.isArray(t.alerts.data?.features)?t.alerts.data.features.filter(s=>s&&typeof s=="object").map(s=>({...s.properties,geometry:s.geometry})):[],this.space=t.space?.ok?t.space.data:null,this.hours.length){let s=this.following?Date.now():this.cursor;this.cursor=N(s,this.hours[0].t,this.hours.at(-1).t)}}reduceModels(t){let o=t?.hourly;if(!o?.time?.length)return null;let n=t.utc_offset_seconds??0,s=Io(n),l=Object.keys(o).filter(y=>y.startsWith("temperature_2m_")).map(y=>y.replace("temperature_2m_","")),w=[];for(let y=0;y<o.time.length;y++){let S=l.map(f=>o[`temperature_2m_${f}`]?.[y]).filter(f=>f!=null),v=l.map(f=>o[`precipitation_${f}`]?.[y]).filter(f=>f!=null);if(!S.length)continue;let i=S.reduce((f,k)=>f+k,0)/S.length;w.push({t:s(o.time[y]),mean:i,min:Math.min(...S),max:Math.max(...S),spread:Math.max(...S)-Math.min(...S),temps:S,precipAgree:v.length?v.filter(f=>f>.004).length/v.length:null})}return{names:l,rows:w}}setCursor(t,{silent:o=!1}={}){if(!this.hours.length)return;let n=this.hours[0].t,s=this.hours.at(-1).t;this.cursor=N(t,n,s),o||this.emit("cursor",this.cursor)}scrubTo(t,o){this.following=!1,this.setCursor(t,o)}syncToNow(){if(!this.following||this.playing||this.view==="radar")return;let t=Date.now();Math.abs(t-this.cursor)<1e3||this.setCursor(t)}toNow(){this.playing=!1,this.following=!0,this.setCursor(Date.now()),this.emit("play",!1)}get atNow(){return Math.abs(this.cursor-Date.now())<9e4}get span(){return this.hours.length?{lo:this.hours[0].t,hi:this.hours.at(-1).t}:{lo:0,hi:0}}frame(t=this.cursor){let o=to(this.hours,t);if(!o)return null;let n={...o,t},s=to(this.min15,t);s&&Math.abs(s.t-t)<30*6e4&&s.precip!=null&&(n.precip=s.precip,n.code=s.code??n.code,s.cape!=null&&(n.cape=s.cape),s.vis!=null&&(n.vis=s.vis),s.gust!=null&&(n.gust=s.gust));let l=to(this.air,t);l&&(n.air=l),n.wx=Qe(Math.round(n.code??0)),n.day=this.dayFor(t);let{lat:w,lon:y}=this.loc||{lat:0,lon:0},S=new Date(t),v=xe(S,w,y),i=Ze(S,w,y),f=Je(S);return n.sun={alt:v.altitude,az:v.azimuth,altDeg:v.altitude*57.29578,compass:He(v.azimuth)},n.moon={alt:i.altitude,az:i.azimuth,altDeg:i.altitude*57.29578,compass:He(i.azimuth),phase:f.phase,fraction:f.fraction,distance:i.distance},n}dayFor(t){let o=this.fmt.isoDate(t);return this.days.find(n=>this.fmt.isoDate(n.t)===o)||null}sunTimesFor(t=this.cursor){let{lat:o,lon:n}=this.loc||{lat:0,lon:0};return $t(new Date(t),o,n,this.elevation||0)}moonTimesFor(t=this.cursor){let{lat:o,lon:n}=this.loc||{lat:0,lon:0};return Mo(new Date(t),o,n)}skyParams(t=this.cursor){let o=this.frame(t);if(!o)return null;let n=o.wx.kind,s=o.precip??0,l=N(s/.12,0,1),w=n==="rain"||n==="snow"||n==="storm"?N(Math.max(o.wx.intensity*.55,l),0,1):l*.6,y=this.currentKp()??2;return{sunAlt:o.sun.alt,sunAz:o.sun.az+Math.PI,moonAlt:o.moon.alt,moonAz:o.moon.az+Math.PI,moonPhase:o.moon.phase,moonFrac:o.moon.fraction,viewAz:this.viewBearing(o),cloudLow:N((o.cloudLow??0)/100,0,1),cloudMid:N((o.cloudMid??0)/100,0,1),cloudHigh:N((o.cloudHigh??0)/100,0,1),precip:w,snow:n==="snow"?1:0,storm:n==="storm"?.85:N((o.cape??0)/2500,0,.6),fog:n==="fog"?.85:N(1-(o.vis??2e4)/6e3,0,.6),wind:o.wind??5,windDir:((o.windDir??0)+180)*Math.PI/180,kp:y,lat:this.loc?.lat??0,haze:N(1-(o.vis??24e3)/24e3,0,.8),cityGlow:.55}}viewBearing(t){let o=(this.loc?.lat??0)>=0?Math.PI:0;return t.sun.altDeg>-8?t.sun.az+Math.PI:t.moon.altDeg>2?t.moon.az+Math.PI:o}currentKp(){let t=this.space?.kpNow;if(t?.ok&&Array.isArray(t.data)&&t.data.length){let o=t.data.at(-1),n=Number(o.estimated_kp??o.kp_index);if(Number.isFinite(n))return n}return null}kpForecast(){let t=this.space?.kpFc;if(!t?.ok||!Array.isArray(t.data)||!t.data.length)return[];let o=t.data;return(Array.isArray(o[0])?o.slice(1).map(s=>({time_tag:s[0],kp:s[1],observed:s[2]})):o).map(s=>({t:Date.parse(String(s.time_tag).replace(" ","T").replace(/Z?$/,"Z")),kp:Number(s.kp??s.kp_index??s.estimated_kp),observed:s.observed})).filter(s=>Number.isFinite(s.kp)&&Number.isFinite(s.t))}},r=new ao;var io=new Set,ne={tier:2,fps:60,onBattery:!1,batteryLevel:1,hidden:!1,reducedMotion:matchMedia("(prefers-reduced-motion: reduce)").matches,manual:null,onChange(e){return io.add(e),()=>io.delete(e)}},so=0,It=0,Po=0,rt=0,lt=0;function Oo(e){so++,It+=e;let t=performance.now();if(t-Po<1e3)return;Po=t,ne.fps=It>0?so/It:60,so=0,It=0,ne.fps<40?(rt++,lt=0):ne.fps>55?(lt++,rt=0):(rt=0,lt=0);let o=st();o!==ne.tier&&it(o)}function qn(){return typeof matchMedia!="function"?!1:matchMedia("(pointer: coarse)").matches&&matchMedia("(max-width: 820px)").matches}function st(){if(ne.manual!=null)return ne.manual;if(ne.hidden)return 0;if(ne.reducedMotion)return 1;if(qn()){let t=1;return rt>=3&&(t=Math.max(0,ne.tier-1)),lt>=6&&ne.tier<2&&(t=ne.tier+1),Math.max(0,Math.min(2,t))}let e=ne.onBattery?2:3;return ne.onBattery&&ne.batteryLevel<.25&&(e=1),rt>=3&&(e=Math.max(0,ne.tier-1)),lt>=6&&e>ne.tier&&(e=ne.tier+1),Math.max(0,Math.min(3,e))}function it(e){ne.tier=e,document.documentElement.dataset.q=String(e),rt=0,lt=0;for(let t of io)t(e)}function Ro(){document.addEventListener("visibilitychange",()=>{ne.hidden=document.hidden,it(st())}),matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{ne.reducedMotion=e.matches,it(st())}),navigator.getBattery&&navigator.getBattery().then(e=>{let t=()=>{ne.onBattery=!e.charging,ne.batteryLevel=e.level,it(st())};e.addEventListener("chargingchange",t),e.addEventListener("levelchange",t),t()}).catch(()=>{}),it(st())}function ro(e){ne.manual=e,it(st())}var Vn=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,jn=`#version 300 es
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
}`,No={sunAlt:.4,sunAz:3,moonAlt:-.4,moonAz:1,moonPhase:.25,moonFrac:.5,viewAz:Math.PI,cloudLow:.2,cloudMid:.1,cloudHigh:.1,precip:0,snow:0,storm:0,fog:0,wind:6,windDir:4,kp:2,lat:33.6,haze:.15,cityGlow:.5},Kn=new Set(["snow","lat"]),Pt=class{constructor(t){this.canvas=t,this.gl=null,this.params={...No},this.target={...No},this.quality=2,this.running=!1,this.flash=0,this.nextBolt=1/0,this.scale=1,this.ok=!1,this.t0=performance.now()}init(){let t=this.canvas.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1});if(!t)return this.ok=!1,!1;this.gl=t;let o=Yn(t,Vn,jn);if(!o)return this.ok=!1,!1;this.prog=o,t.useProgram(o);let n=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,n),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let s=t.getAttribLocation(o,"aPos");t.enableVertexAttribArray(s),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0),this.u={};for(let l of["uRes","uTime","uQuality","uSunAlt","uSunAz","uMoonAlt","uMoonAz","uMoonPhase","uMoonFrac","uViewAz","uCloudLow","uCloudMid","uCloudHigh","uPrecip","uSnow","uStorm","uFlash","uFog","uWind","uWindDir","uKp","uLat","uHaze","uCityGlow"])this.u[l]=t.getUniformLocation(o,l);return this.resize(),this.ok=!0,!0}set(t){Object.assign(this.target,t)}snap(t){Object.assign(this.target,t),Object.assign(this.params,t)}setQuality(t){this.quality=t,this.scale=t>=3?1:t===2?.85:t===1?.65:.5,this.resize()}resize(){let t=this.gl;if(!t)return;let o=Math.min(window.devicePixelRatio||1,this.quality>=3?2:1.5),n=Math.max(2,Math.floor(this.canvas.clientWidth*o*this.scale)),s=Math.max(2,Math.floor(this.canvas.clientHeight*o*this.scale));this.canvas.width===n&&this.canvas.height===s||(this.canvas.width=n,this.canvas.height=s,t.viewport(0,0,n,s))}render(t,o){if(!this.ok)return;let n=this.gl,s=this.params,l=this.target,w=1-Math.pow(.0016,o);for(let S in l){if(Kn.has(S)){s[S]=l[S];continue}if(S.endsWith("Az")||S==="windDir"){let v=l[S]-s[S];v=((v+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,s[S]+=v*w}else s[S]+=(l[S]-s[S])*w}s.storm>.12?(this.nextBolt===1/0&&(this.nextBolt=t+Math.random()*3e3),t>this.nextBolt&&(this.flash=.3+Math.random()*.45,this.nextBolt=t+900+Math.random()*9e3*(1.15-s.storm))):this.nextBolt=1/0,this.flash*=Math.pow(8e-5,o),this.flash<.002&&(this.flash=0);let y=this.u;n.uniform2f(y.uRes,this.canvas.width,this.canvas.height),n.uniform1f(y.uTime,(t-this.t0)/1e3),n.uniform1i(y.uQuality,this.quality),n.uniform1f(y.uSunAlt,s.sunAlt),n.uniform1f(y.uSunAz,s.sunAz),n.uniform1f(y.uMoonAlt,s.moonAlt),n.uniform1f(y.uMoonAz,s.moonAz),n.uniform1f(y.uMoonPhase,s.moonPhase),n.uniform1f(y.uMoonFrac,s.moonFrac),n.uniform1f(y.uViewAz,s.viewAz),n.uniform1f(y.uCloudLow,s.cloudLow),n.uniform1f(y.uCloudMid,s.cloudMid),n.uniform1f(y.uCloudHigh,s.cloudHigh),n.uniform1f(y.uPrecip,s.precip),n.uniform1f(y.uSnow,s.snow),n.uniform1f(y.uStorm,s.storm),n.uniform1f(y.uFlash,this.flash),n.uniform1f(y.uFog,s.fog),n.uniform1f(y.uWind,s.wind),n.uniform1f(y.uWindDir,s.windDir),n.uniform1f(y.uKp,s.kp),n.uniform1f(y.uLat,s.lat),n.uniform1f(y.uHaze,s.haze),n.uniform1f(y.uCityGlow,s.cityGlow),n.drawArrays(n.TRIANGLES,0,3)}};function Yn(e,t,o){let n=Ho(e,e.VERTEX_SHADER,t),s=Ho(e,e.FRAGMENT_SHADER,o);if(!n||!s)return null;let l=e.createProgram();return e.attachShader(l,n),e.attachShader(l,s),e.linkProgram(l),e.getProgramParameter(l,e.LINK_STATUS)?(e.deleteShader(n),e.deleteShader(s),l):(console.error("[sky] link failed:",e.getProgramInfoLog(l)),null)}function Ho(e,t,o){let n=e.createShader(t);if(e.shaderSource(n,o),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){let s=e.getShaderInfoLog(n);console.error(`[sky] ${t===e.VERTEX_SHADER?"vertex":"fragment"} compile failed:
${s}`);let l=/ERROR:\s*\d+:(\d+)/.exec(s||"");if(l){let w=o.split(`
`),y=+l[1];console.error(w.slice(Math.max(0,y-3),y+2).map((S,v)=>`${Math.max(1,y-2)+v}| ${S}`).join(`
`))}return null}return n}var j=["#3fd0d8","#f07aa6","#f2b45a","#b39dfa","#7fb2f0"],R={good:"#8fdc6a",warn:"#ecd46a",serious:"#f59a5b",crit:"#f47171"},ve="#dde2e8",pe="#b3bfcc",ae="#8d9aab",lo="rgba(255,255,255,.055)",xn="#0f1826",zo="#16212f",Zn="500 12px 'JetBrains Mono', ui-monospace, monospace",Se="500 11.5px 'JetBrains Mono', ui-monospace, monospace",ye="600 11.5px 'Chakra Petch', system-ui, sans-serif";function Ee(e){if(e==null)return pe;let t=[[-20,"#9d8ef5"],[10,"#6aa9f0"],[32,"#3fd0d8"],[50,"#5cd6bc"],[65,"#a2d86a"],[78,"#ecd46a"],[88,"#f59a5b"],[100,"#f47171"],[115,"#f07aa6"]];if(e<=t[0][0])return t[0][1];if(e>=t.at(-1)[0])return t.at(-1)[1];for(let o=0;o<t.length-1;o++){let[n,s]=t[o],[l,w]=t[o+1];if(e>=n&&e<=l)return Be(s,w,(e-n)/(l-n))}return pe}function Be(e,t,o){let n=[1,3,5].map(w=>parseInt(e.slice(w,w+2),16)),s=[1,3,5].map(w=>parseInt(t.slice(w,w+2),16));return`#${n.map((w,y)=>Math.round(Tt(w,s[y],N(o,0,1)))).map(w=>w.toString(16).padStart(2,"0")).join("")}`}function V(e,t){let o=[1,3,5].map(n=>parseInt(e.slice(n,n+2),16));return`rgba(${o[0]},${o[1]},${o[2]},${t})`}var Xe=new Set;function Bo(){for(let e of Xe)e.hover=null,e.render();Xe.clear()}var Fo=10;function le(e,t,{onPick:o,inspect:n=!0}={}){let s=e.getContext("2d"),l={canvas:e,ctx:s,hover:null,data:null,draw:t,dirty:!0},w=()=>{let h=Math.min(window.devicePixelRatio||1,2),g=e.clientWidth,E=e.clientHeight;if(!g||!E)return;let M=Math.round(g*h),$=Math.round(E*h);(e.width!==M||e.height!==$)&&(e.width=M,e.height=$),s.setTransform(h,0,0,h,0,0),l.w=g,l.h=E,l.render()};l.render=()=>{if(!(!l.w||!l.h)){s.clearRect(0,0,l.w,l.h);try{t(s,l.w,l.h,l.hover,l.data)}catch(h){console.error("[chart]",h.stack||h)}}},l.update=h=>{l.data=h,l.render()};let y=new ResizeObserver(w);y.observe(e),n&&(e.style.touchAction="pan-y");let S=h=>{let g=e.getBoundingClientRect();return{x:h.clientX-g.left,y:h.clientY-g.top}},v=h=>!!h.pointerType&&h.pointerType!=="mouse",i=(h,g)=>{l.hover={x:h.x,y:h.y,coarse:g},l.render()},f=()=>{Xe.delete(l),l.hover=null,l.render()},k=null,u=h=>{if(!v(h)){i(S(h),!1);return}k&&(k.moved=Math.max(k.moved,Math.hypot(h.clientX-k.cx,h.clientY-k.cy)),n&&i(S(h),!0))},d=h=>{let g=S(h);if(k={x:g.x,y:g.y,cx:h.clientX,cy:h.clientY,moved:0,coarse:v(h)},!k.coarse||!n)return;let E=l.hover;k.dismiss=!!E&&!!E.coarse&&Math.abs(E.x-g.x)<14&&Math.abs(E.y-g.y)<14;for(let M of Xe)M!==l&&(M.hover=null,M.render());Xe.clear(),Xe.add(l),i(g,!0)},p=h=>{let g=k;k=null,g&&(g.coarse&&n&&g.dismiss&&g.moved<Fo&&f(),o&&g.moved<Fo&&o({x:g.x,y:g.y,w:l.w,h:l.h},h))},a=()=>{k&&k.coarse&&n&&f(),k=null},c=h=>{v(h)||(l.hover=null,l.render())};return e.addEventListener("pointermove",u),e.addEventListener("pointerdown",d),e.addEventListener("pointerup",p),e.addEventListener("pointercancel",a),e.addEventListener("pointerleave",c),o&&(e.style.cursor="crosshair"),l.destroy=()=>{y.disconnect(),Xe.delete(l),e.removeEventListener("pointermove",u),e.removeEventListener("pointerdown",d),e.removeEventListener("pointerup",p),e.removeEventListener("pointercancel",a),e.removeEventListener("pointerleave",c)},w(),l}function $e(e,t,o,{width:n=2,glow:s=12,closed:l=!1}={}){if(t.length<2)return;let w=()=>{e.beginPath(),e.moveTo(t[0][0],t[0][1]);for(let y=1;y<t.length;y++)e.lineTo(t[y][0],t[y][1]);l&&e.closePath()};e.lineJoin="round",e.lineCap="round",s&&(e.save(),e.shadowColor=o,e.shadowBlur=s/2,e.strokeStyle=V(o,.55),e.lineWidth=n,w(),e.stroke(),e.restore()),e.strokeStyle=o,e.lineWidth=n,w(),e.stroke()}function Pe(e,t){if(!(t.length<2)){e.moveTo(t[0][0],t[0][1]);for(let o=0;o<t.length-1;o++){let n=t[Math.max(0,o-1)],s=t[o],l=t[o+1],w=t[Math.min(t.length-1,o+2)];e.bezierCurveTo(s[0]+(l[0]-n[0])/6,s[1]+(l[1]-n[1])/6,l[0]-(w[0]-s[0])/6,l[1]-(w[1]-s[1])/6,l[0],l[1])}}}function Ce(e,t,o,n=String,{color:s=lo,label:l=!0}={}){e.save(),e.strokeStyle=s,e.lineWidth=1,e.font=Se,e.fillStyle=ae,e.textAlign="right",e.textBaseline="middle";let w=-1e9;for(let{v:y,y:S}of o){if(e.beginPath(),e.moveTo(t.x,Math.round(S)+.5),e.lineTo(t.x+t.w,Math.round(S)+.5),e.stroke(),!l)continue;let v=S-t.y<9?S+6:S-5;Math.abs(v-w)<14||(Ae(e,n(y),t.x+t.w-2,v),w=v)}e.restore()}function Ve(e,t,o,n,s,l,w=3){let y=Math.abs(s-o);if(y<.4)return;let S=Math.min(w,n/2,y);e.beginPath(),e.moveTo(t,s),e.lineTo(t,o+S),e.quadraticCurveTo(t,o,t+S,o),e.lineTo(t+n-S,o),e.quadraticCurveTo(t+n,o,t+n,o+S),e.lineTo(t+n,s),e.closePath(),e.fillStyle=l,e.save(),e.globalAlpha*=.6,e.fill(),e.clip(),e.globalAlpha/=.6,e.fillRect(t,o,n,Math.min(2.5,y)),e.restore()}function Ae(e,t,o,n,s=3){e.save(),e.lineWidth=s,e.lineJoin="round",e.strokeStyle=V(zo,.9),e.strokeText(t,o,n),e.restore(),e.fillText(t,o,n)}function be(e,t,o,n,s=ae,l="left"){e.save(),e.font=ye,e.fillStyle=s,e.textAlign=l,e.textBaseline="top",e.letterSpacing="1.4px",Ae(e,n.toUpperCase(),t,o),e.restore()}function et(e,t,o,n,s,l,w="#3fd0d8",{pin:y=!1}={}){e.save(),e.font=Zn;let i=Math.max(...n.map(p=>e.measureText(p.replace(/\|/g,"  ")).width))+14,f=n.length*13+14-2,k,u;y?(k=t>s/2?4:Math.max(4,s-i-4),u=o<l/2?Math.max(4,l-f-4):4):(k=t+12,u=N(o-f-10,4,l-f-4),k+i>s-4&&(k=t-i-12),k=N(k,4,Math.max(4,s-i-4))),e.fillStyle=V(zo,.94),e.strokeStyle=V(w,.5),e.lineWidth=1;let d=5;e.beginPath(),e.moveTo(k,u+d),e.lineTo(k+d,u),e.lineTo(k+i,u),e.lineTo(k+i,u+f-d),e.lineTo(k+i-d,u+f),e.lineTo(k,u+f),e.closePath(),e.fill(),e.stroke(),e.textBaseline="top",n.forEach((p,a)=>{let[c,h]=p.split("|");e.textAlign="left",e.fillStyle=a===0?w:pe,e.fillText(c,k+7,u+7+a*13),h!=null&&(e.textAlign="right",e.fillStyle=a===0?w:ve,e.fillText(h,k+i-7,u+7+a*13))}),e.restore()}function Jn(e,t,o,n,{align:s="left"}={}){e.save(),e.font=ye,e.textBaseline="middle",e.letterSpacing="1.2px";let l=0,w=n.map(S=>{let v=e.measureText(S.label.toUpperCase()).width+16;return l+=v,v}),y=s==="right"?t-l:t;n.forEach((S,v)=>{e.fillStyle=S.color,S.dash?(e.strokeStyle=S.color,e.lineWidth=2,e.setLineDash([3,2]),e.beginPath(),e.moveTo(y,o),e.lineTo(y+9,o),e.stroke(),e.setLineDash([])):e.fillRect(y,o-3,9,3),e.fillStyle=pe,e.textAlign="left",e.fillText(S.label.toUpperCase(),y+13,o),y+=w[v]}),e.restore()}function _o(e,t,o,n,s){e.save(),e.fillStyle="rgba(8,13,22,.32)";for(let l of o){if(!l.sunset||!l.sunrise)continue;let w=o[o.indexOf(l)+1],y=n(l.sunset),S=w?.sunrise?n(w.sunrise):t.x+t.w,v=N(y,t.x,t.x+t.w),i=N(S,t.x,t.x+t.w);i>v&&e.fillRect(v,t.y,i-v,t.h)}e.restore()}function Ot(e,t,o,n,s,{dash:l=null,flagTop:w=!0}={}){if(e.save(),e.strokeStyle=n,e.lineWidth=1,l&&e.setLineDash(l),e.shadowColor=n,e.shadowBlur=4,e.beginPath(),e.moveTo(Math.round(t)+.5,o.y),e.lineTo(Math.round(t)+.5,o.y+o.h),e.stroke(),e.restore(),s){e.save(),e.font=ye,e.letterSpacing="1.2px";let y=e.measureText(s).width+8,S=N(t-y/2,o.x,o.x+o.w-y),v=w?o.y:o.y+o.h-11;e.fillStyle=n,e.fillRect(S,v,y,11),e.fillStyle=xn,e.textAlign="center",e.textBaseline="middle",e.fillText(s,S+y/2,v+6),e.restore()}}function _e(e,t=4){return N(Math.floor(e/26),1,t)}function Rt(e,t,o,{gap:n=8,least:s=1}={}){if(e<2||t<=0)return s;let l=t/(e-1);return Math.max(s,Math.ceil((o+n)/Math.max(l,.5)))}function Oe(e,t,o,n,s,l){let w=e.measureText(t).width;return w>l-s?!1:(e.fillText(t,N(o,s+w/2,l-w/2),n),!0)}function gt(e,t,o,n,s=[],{short:l=null}={}){let w=(f,k)=>{e.save(),e.font=ye,e.letterSpacing=f;let u=e.measureText(String(k).toUpperCase()).width;return e.restore(),u},y=(f,k)=>w("1.4px",f)+k.reduce((u,d)=>u+w("1.2px",d.label)+16,0)+14,S=s.map(f=>f.short?{...f,label:f.short}:f),[v,i]=[[n,s],[n,S],[l??n,S],[l??n,[]]].find(([f,k])=>y(f,k)<=t.w)??[l??n,[]];be(e,t.x+2,o,v),i.length&&Jn(e,t.x+t.w,o+5,i,{align:"right"})}function We(e,t,o=4){if(!Number.isFinite(e)||!Number.isFinite(t)||e===t)return[e||0];let s=(t-e)/o,l=Math.pow(10,Math.floor(Math.log10(s))),w=s/l,y=(w<1.5?1:w<3?2:w<7?5:10)*l,S=[];for(let v=Math.ceil(e/y)*y;v<=t+1e-9;v+=y)S.push(+v.toFixed(6));return S}function je(e,t,o,n,{value:s,min:l=0,max:w=100,color:y=j[0],label:S="",unit:v="",bands:i=null,sub:f="",decimals:k=0,ticks:u=5}){let d=Math.PI*.75,p=Math.PI*2.25,a=s==null?0:N((s-l)/(w-l),0,1),c=d+(p-d)*a;if(e.save(),e.lineCap="butt",e.beginPath(),e.arc(t,o,n,d,p),e.strokeStyle="rgba(255,255,255,.07)",e.lineWidth=6,e.stroke(),i)for(let M of i){let $=N((M.from-l)/(w-l),0,1),m=N((M.to-l)/(w-l),0,1);m<=$||(e.beginPath(),e.arc(t,o,n+6,d+(p-d)*$,d+(p-d)*m),e.strokeStyle=V(M.color,.55),e.lineWidth=2.5,e.stroke())}e.strokeStyle="rgba(255,255,255,.14)",e.lineWidth=1;for(let M=0;M<=u;M++){let $=d+(p-d)*(M/u),m=Math.cos($),T=Math.sin($);e.beginPath(),e.moveTo(t+m*(n-5),o+T*(n-5)),e.lineTo(t+m*(n-10),o+T*(n-10)),e.stroke()}if(s!=null&&a>.001){e.save(),e.shadowColor=y,e.shadowBlur=7,e.beginPath(),e.arc(t,o,n,d,c),e.strokeStyle=y,e.lineWidth=6,e.stroke(),e.restore();let M=Math.cos(c),$=Math.sin(c);e.beginPath(),e.arc(t+M*n,o+$*n,3.2,0,Math.PI*2),e.fillStyle=ve,e.shadowColor=y,e.shadowBlur=5,e.fill(),e.shadowBlur=0}e.textAlign="center",e.textBaseline="alphabetic",e.fillStyle=ve,e.font=`700 ${Math.round(n*.62)}px 'JetBrains Mono', monospace`;let h=s==null?"--":s.toFixed(k),g=o+n*.18,E=e.measureText(h).actualBoundingBoxDescent;if(e.fillText(h,t,g),v){e.font=Se,e.fillStyle=pe;let M=e.measureText(v).actualBoundingBoxAscent;e.fillText(v,t,Math.max(o+n*.46,g+E+M+3))}S&&(e.font=ye,e.fillStyle=ae,e.letterSpacing="1.4px",e.fillText(S.toUpperCase(),t,o+n+15)),f&&(e.font=ye,e.fillStyle=y,e.letterSpacing="1.2px",Ae(e,f.toUpperCase(),t,o-n*.42)),e.restore()}function Wo(e,t,o,{color:n=j[0],fill:s=!0,width:l=1.8,min:w=null,max:y=null,glow:S=8}){let v=o.filter(d=>d!=null);if(v.length<2)return;let i=w??Math.min(...v),k=(y??Math.max(...v))-i||1,u=o.map((d,p)=>[t.x+p/(o.length-1)*t.w,t.y+t.h-((d??i)-i)/k*t.h]);if(s){e.save(),e.beginPath(),Pe(e,u),e.lineTo(u.at(-1)[0],t.y+t.h),e.lineTo(u[0][0],t.y+t.h),e.closePath();let d=e.createLinearGradient(0,t.y,0,t.y+t.h);d.addColorStop(0,V(n,.34)),d.addColorStop(1,V(n,0)),e.fillStyle=d,e.fill(),e.restore()}return e.save(),S&&(e.shadowColor=n,e.shadowBlur=S/2),e.beginPath(),Pe(e,u),e.strokeStyle=n,e.lineWidth=l,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore(),u}function Uo(e,t,o,n,{dir:s,speed:l,gust:w,color:y=j[0]}){e.save(),e.strokeStyle="rgba(255,255,255,.09)",e.lineWidth=1,e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.stroke(),e.font=ye,e.fillStyle=ae,e.textAlign="center",e.textBaseline="middle";for(let[f,k]of[["N",-90],["E",0],["S",90],["W",180]]){let u=k*Math.PI/180;e.fillText(f,t+Math.cos(u)*(n+8),o+Math.sin(u)*(n+8))}for(let f=0;f<16;f++){let k=(f*22.5-90)*Math.PI/180,u=f%4===0;e.strokeStyle=u?"rgba(255,255,255,.20)":"rgba(255,255,255,.09)",e.beginPath(),e.moveTo(t+Math.cos(k)*n,o+Math.sin(k)*n),e.lineTo(t+Math.cos(k)*(n-(u?7:4)),o+Math.sin(k)*(n-(u?7:4))),e.stroke()}if(s!=null){let f=(s-90+180)*Math.PI/180,k=n-10;e.save(),e.translate(t,o),e.rotate(f),e.shadowColor=y,e.shadowBlur=6,e.fillStyle=y,e.beginPath(),e.moveTo(k,0),e.lineTo(k-9,-5.5),e.lineTo(k-6,0),e.lineTo(k-9,5.5),e.closePath(),e.fill(),e.strokeStyle=y,e.lineWidth=2,e.beginPath(),e.moveTo(-k*.55,0),e.lineTo(k-7,0),e.stroke(),e.restore()}e.textAlign="center",e.textBaseline="alphabetic",e.fillStyle=ve,e.font=`700 ${Math.round(n*.44)}px 'JetBrains Mono', monospace`;let S=l==null?"--":String(Math.round(l)),v=o+n*.06,i=e.measureText(S).actualBoundingBoxDescent;e.fillText(S,t,v),e.font=Se,e.fillStyle=pe,e.fillText("mph",t,Math.max(o+n*.3,v+i+e.measureText("mph").actualBoundingBoxAscent+3)),w!=null&&w>(l??0)+1&&(e.font=Se,e.fillStyle=R.serious,e.fillText(`G${Math.round(w)}`,t,o-n*.26)),e.restore()}function Nt(e,t,o,n,s,l){e.save(),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.fillStyle="#16212f",e.fill(),e.strokeStyle="rgba(127,178,240,.22)",e.lineWidth=1,e.stroke();let w=1-2*N(l,0,1),y=s<.5;e.save(),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.clip(),e.beginPath();let S=48;for(let i=0;i<=S;i++){let f=-1+2*i/S,k=w*Math.sqrt(Math.max(0,1-f*f)),u=t+(y?k:-k)*n;i===0?e.moveTo(u,o+f*n):e.lineTo(u,o+f*n)}for(let i=S;i>=0;i--){let f=-1+2*i/S;e.lineTo(t+(y?1:-1)*Math.sqrt(Math.max(0,1-f*f))*n,o+f*n)}e.closePath();let v=e.createRadialGradient(t-n*.25,o-n*.25,n*.1,t,o,n);v.addColorStop(0,"#f2f6ff"),v.addColorStop(1,"#b9c6da"),e.fillStyle=v,e.shadowColor="rgba(200,225,255,.7)",e.shadowBlur=n*.5,e.fill(),e.shadowBlur=0,e.globalCompositeOperation="multiply",e.fillStyle="rgba(150,165,190,.55)";for(let[i,f,k]of[[-.28,-.2,.26],[.1,-.34,.18],[.22,.1,.22],[-.15,.3,.16],[-.42,.12,.13]])e.beginPath(),e.arc(t+i*n,o+f*n,k*n,0,Math.PI*2),e.fill();e.restore(),e.restore()}function Go(e,t,o,n,{sunTrack:s=[],moonTrack:l=[],sun:w=null,moon:y=null,iss:S=null,night:v=0}){let i=(d,p)=>{let a=(1-N(p,0,90)/90)*n,c=(d-90)*Math.PI/180;return[t+Math.cos(c)*a,o+Math.sin(c)*a]};e.save();let f=e.createRadialGradient(t,o,0,t,o,n);f.addColorStop(0,v>.5?"rgba(6,12,30,.85)":"rgba(10,40,72,.55)"),f.addColorStop(1,v>.5?"rgba(2,4,12,.6)":"rgba(6,20,40,.4)"),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.fillStyle=f,e.fill(),e.strokeStyle="rgba(255,255,255,.10)",e.lineWidth=1;for(let d of[30,60])e.beginPath(),e.arc(t,o,(1-d/90)*n,0,Math.PI*2),e.stroke();e.strokeStyle="rgba(63,208,216,.28)",e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.stroke(),e.font=ye,e.textAlign="center",e.textBaseline="middle";for(let[d,p]of[["N",0],["E",90],["S",180],["W",270]]){let[a,c]=i(p,0);e.strokeStyle="rgba(255,255,255,.07)",e.beginPath(),e.moveTo(t,o),e.lineTo(a,c),e.stroke();let[h,g]=i(p,-9);e.fillStyle=ae,e.fillText(d,h,g)}let k=(d,p,a)=>{let c=[],h=()=>{c.length>1&&(e.save(),a&&e.setLineDash(a),$e(e,c,p,{width:1.5,glow:6}),e.restore()),c=[]};for(let g of d){if(g.alt<0){h();continue}c.push(i(g.az,g.alt))}h()};k(s,"#f2b45a",null),k(l,"#7fb2f0",[3,3]);let u=(d,p,a)=>{if(!d||d.alt<-2)return;let[c,h]=i(d.az,Math.max(0,d.alt));e.save(),e.shadowColor=p,e.shadowBlur=8,e.fillStyle=p,e.beginPath(),e.arc(c,h,a,0,Math.PI*2),e.fill(),e.restore(),d.alt<0&&(e.strokeStyle=V(p,.5),e.setLineDash([2,2]),e.beginPath(),e.arc(c,h,a+3,0,Math.PI*2),e.stroke(),e.setLineDash([]))};if(u(y,"#c9d8f5",5),u(w,"#efc865",6.5),S){let[d,p]=i(S.az,Math.max(0,S.alt));e.save(),e.strokeStyle="#8fdc6a",e.lineWidth=1.5,e.shadowColor="#8fdc6a",e.shadowBlur=5,e.beginPath(),e.arc(d,p,4,0,Math.PI*2),e.stroke(),e.beginPath(),e.moveTo(d-7,p),e.lineTo(d+7,p),e.stroke(),e.restore()}e.restore()}var tt=8,qo=8,Vo=16,jo=15;function Ko(e){e.innerHTML=`
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
  `;let t=e.querySelector(".tl-canvas"),o=e.querySelector(".tl-when b"),n=e.querySelector(".tl-when span"),s=e.querySelector(".tl-delta"),l=e.querySelector(".tl-play"),w=!1,y=le(t,v,{inspect:!1});function S(d){let{lo:p,hi:a}=r.span,c=d-tt-qo;return{lo:p,hi:a,plotW:c,xOf:h=>tt+(h-p)/(a-p||1)*c,tOf:h=>p+(h-tt)/c*(a-p||1)}}function v(d,p,a,c){let h=r.hours;if(!h?.length)return;let g=S(p),E=r.fmt,M={x:tt,y:Vo,w:g.plotW,h:a-Vo-jo};d.save(),d.fillStyle="rgba(8,13,22,.4)";for(let B=0;B<r.days.length;B++){let J=r.days[B],se=r.days[B+1];if(!J.sunset)continue;let Q=N(g.xOf(J.sunset),M.x,M.x+M.w),x=N(se?.sunrise?g.xOf(se.sunrise):M.x+M.w,M.x,M.x+M.w);x>Q&&d.fillRect(Q,M.y,x-Q,M.h)}d.restore();let $=h.map(B=>B.temp).filter(B=>B!=null),m=Math.min(...$),T=Math.max(...$),L=B=>M.y+M.h*.92-(B-m)/(T-m||1)*M.h*.72,C=h.filter(B=>B.temp!=null).map(B=>[g.xOf(B.t),L(B.temp)]);d.save(),d.beginPath(),Pe(d,C),d.lineTo(C.at(-1)[0],M.y+M.h),d.lineTo(C[0][0],M.y+M.h),d.closePath();let O=d.createLinearGradient(0,M.y,0,M.y+M.h);O.addColorStop(0,V(Ee(T),.34)),O.addColorStop(1,V(Ee(m),.03)),d.fillStyle=O,d.fill(),d.restore();let _=d.createLinearGradient(tt,0,tt+g.plotW,0);for(let B=0;B<=12;B++){let J=h[Math.round(B/12*(h.length-1))];_.addColorStop(B/12,Ee(J?.temp))}d.save(),d.shadowColor=V(j[0],.8),d.shadowBlur=4,d.beginPath(),Pe(d,C),d.strokeStyle=_,d.lineWidth=1.8,d.lineJoin="round",d.stroke(),d.restore();let A=Math.max(...h.map(B=>B.precip??0),.02);d.save();for(let B of h){let J=B.precip??0;if(J<.001)continue;let se=g.xOf(B.t),Q=N(J/A,.08,1)*M.h*.3;d.fillStyle=V(j[4],.75),d.fillRect(se-.7,M.y+M.h-Q,1.6,Q)}d.restore(),d.save(),d.font=ye,d.letterSpacing="1.2px",d.textBaseline="top";let I=r.days.length>1?Math.abs(g.xOf(r.days[1].t)-g.xOf(r.days[0].t)):M.w,H=34,G=Math.max(1,Math.ceil(H/Math.max(1,I))),W=0;for(let B of r.days){let J=g.xOf(B.t),se=W++%G===0;J<M.x||J>M.x+M.w||(d.strokeStyle=se?"rgba(255,255,255,.10)":"rgba(255,255,255,.05)",d.lineWidth=1,d.beginPath(),d.moveTo(Math.round(J)+.5,M.y),d.lineTo(Math.round(J)+.5,M.y+M.h),d.stroke(),!(!se||J+H>M.x+M.w)&&(d.fillStyle=ae,d.textAlign="left",d.fillText(E.weekday(B.t).toUpperCase(),J+3,a-jo+3)))}d.restore();for(let B of r.alerts){let J=Date.parse(B.effective||B.onset||0),se=Date.parse(B.expires||B.ends||0);if(!J||!se)continue;let Q=N(g.xOf(J),M.x,M.x+M.w),x=N(g.xOf(se),M.x,M.x+M.w);x<=Q||(d.fillStyle=V(R.crit,.55),d.fillRect(Q,M.y-4,x-Q,3))}let P=Date.now(),U=g.xOf(P);if(U>=M.x&&U<=M.x+M.w&&(d.save(),d.strokeStyle=V(R.good,.85),d.lineWidth=1,d.setLineDash([2,3]),d.shadowColor=R.good,d.shadowBlur=4,d.beginPath(),d.moveTo(Math.round(U)+.5,M.y-4),d.lineTo(Math.round(U)+.5,M.y+M.h),d.stroke(),d.restore()),c&&!w&&c.x>M.x&&c.x<M.x+M.w){let B=g.tOf(c.x);d.save(),d.strokeStyle="rgba(255,255,255,.22)",d.lineWidth=1,d.beginPath(),d.moveTo(Math.round(c.x)+.5,M.y),d.lineTo(Math.round(c.x)+.5,M.y+M.h),d.stroke(),d.font=Se,d.fillStyle=pe,d.textAlign=c.x>p-70?"right":"left",d.textBaseline="top",d.fillText(`${E.weekday(B)} ${E.hm(B)}`,c.x+(c.x>p-70?-5:5),2),d.restore()}let Y=g.xOf(r.cursor);d.save(),d.strokeStyle=j[1],d.lineWidth=1.5,d.shadowColor=j[1],d.shadowBlur=7,d.beginPath(),d.moveTo(Math.round(Y)+.5,M.y-6),d.lineTo(Math.round(Y)+.5,M.y+M.h+3),d.stroke(),d.fillStyle=j[1],d.beginPath(),d.moveTo(Y,M.y-10),d.lineTo(Y+5,M.y-16),d.lineTo(Y-5,M.y-16),d.closePath(),d.fill(),d.restore()}let i=d=>{let p=t.getBoundingClientRect(),a=S(p.width);r.playing=!1,k(),r.scrubTo(a.tOf(N(d-p.left,tt,p.width-qo)))};t.addEventListener("pointerdown",d=>{w=!0,t.setPointerCapture(d.pointerId),i(d.clientX)}),t.addEventListener("pointermove",d=>{w&&i(d.clientX)});let f=d=>{if(w){w=!1;try{t.releasePointerCapture(d.pointerId)}catch{}}};t.addEventListener("pointerup",f),t.addEventListener("pointercancel",f),t.style.cursor="ew-resize",e.addEventListener("click",d=>{let p=d.target.closest("button");if(!p)return;if(p.dataset.rate){r.playRate=+p.dataset.rate,e.querySelectorAll("[data-rate]").forEach(c=>c.classList.toggle("on",+c.dataset.rate===r.playRate));return}let a=p.dataset.act;a==="now"?r.toNow():a==="back"?(r.playing=!1,r.scrubTo(r.cursor-36e5)):a==="fwd"?(r.playing=!1,r.scrubTo(r.cursor+36e5)):a==="play"&&(r.playing=!r.playing,r.playing&&r.view!=="radar"&&(r.following=!1),r.playing&&r.cursor>=r.span.hi-6e4&&r.setCursor(Date.now()),r.emit("play",r.playing)),k()});function k(){l.textContent=r.playing?"\u275A\u275A":"\u25B6",l.classList.toggle("on",r.playing),e.querySelector(".tl-now").classList.toggle("on",r.atNow)}function u(){let d=r.fmt,p=r.cursor;o.textContent=d.hm12(p),n.textContent=`${d.weekday(p)} ${d.monthDay(p)}`;let a=p-Date.now(),c=Math.round(Math.abs(a)/6e4);if(c<3)s.textContent="NOW",s.className="tl-delta now";else{let h=Math.floor(c/60),g=c%60,E=h>=24?`${Math.floor(h/24)}d ${h%24}h`:h?`${h}h ${g}m`:`${g}m`;s.textContent=a>0?`+${E}`:`\u2212${E}`,s.className="tl-delta "+(a>0?"fwd":"back")}k()}return r.on("cursor",()=>{u(),y.render()}),r.on("data",()=>{u(),y.render()}),r.on("play",k),e.querySelector('[data-rate="1"]').classList.add("on"),u(),{render:()=>y.render(),tick(d){if(!r.playing||r.view==="radar")return;let p=r.cursor+d*1e3*3600*r.playRate;p>=r.span.hi?(r.setCursor(r.span.hi),r.playing=!1,r.emit("play",!1),k()):r.setCursor(p)}}}function Ht(e,t,o,n,s){let{hours:l,days:w,span:y,cursor:S,now:v,tf:i,panels:f=["temp","pop"],showAxis:k=!0}=s;if(!l?.length)return;let u=4,d=30,p=14,a=k?30:4,c=t-u-d;if(c<30)return;let h=l.filter(A=>A.t>=y.lo-36e5&&A.t<=y.hi+36e5);if(h.length<2)return;let g=A=>u+(A-y.lo)/(y.hi-y.lo)*c,E=A=>y.lo+(A-u)/c*(y.hi-y.lo),M={temp:1,pop:.42,wind:.42,cloud:.3,pressure:.42,uv:.36,cape:.36},$=f.reduce((A,I)=>A+(M[I]||.4),0),m=f.length>2?16:9,T=o-p-a-(f.length-1)*m,L=p,C={};for(let A of f){let I=T*(M[A]||.4)/$;C[A]={x:u,y:L,w:c,h:I},L+=I+m}let O={x:u,y:p,w:c,h:o-p-a};if(_o(e,O,w||[],g),w?.length){e.save(),e.strokeStyle="rgba(255,255,255,.07)",e.lineWidth=1,e.font=ye,e.letterSpacing="1.2px",e.textBaseline="top";for(let A of w){let I=g(A.t);I<u-1||I>u+c||(e.beginPath(),e.moveTo(Math.round(I)+.5,p),e.lineTo(Math.round(I)+.5,p+O.h),e.stroke(),k&&(e.fillStyle=ae,e.textAlign="left",e.fillText(i.weekday(A.t).toUpperCase(),I+3,o-a+17)))}e.restore()}let _=[];if(C.temp){let A=C.temp,I=h.map(Q=>Q.temp).filter(Q=>Q!=null),H=h.map(Q=>Q.feels).filter(Q=>Q!=null),G=I.concat(H),W=Math.min(...G)-2,P=Math.max(...G)+2,U=Q=>A.y+A.h-(Q-W)/(P-W)*A.h;if(Ce(e,A,We(W,P,_e(A.h,3)).map(Q=>({v:Q,y:U(Q)})),Q=>`${Math.round(Q)}\xB0`),H.length>1){e.save(),e.setLineDash([4,3]);let Q=h.filter(x=>x.feels!=null).map(x=>[g(x.t),U(x.feels)]);$e(e,Q,V(j[1],.75),{width:1.5,glow:6}),e.restore()}let Y=h.filter(Q=>Q.temp!=null).map(Q=>[g(Q.t),U(Q.temp)]);e.save(),e.beginPath(),Pe(e,Y),e.lineTo(Y.at(-1)[0],A.y+A.h),e.lineTo(Y[0][0],A.y+A.h),e.closePath();let B=e.createLinearGradient(0,A.y,0,A.y+A.h);B.addColorStop(0,V(Ee(P),.3)),B.addColorStop(1,V(Ee(W),.02)),e.fillStyle=B,e.fill(),e.restore();let J=e.createLinearGradient(u,0,u+c,0);for(let Q=0;Q<=8;Q++){let x=h[Math.round(Q/8*(h.length-1))];J.addColorStop(Q/8,Ee(x?.temp))}e.save(),e.shadowColor=V(j[0],.9),e.shadowBlur=6,e.beginPath(),Pe(e,Y),e.strokeStyle=J,e.lineWidth=2.2,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore(),e.save(),e.font=Se,e.textAlign="center",e.textBaseline="bottom";let se=e.measureText("100\xB0").width+6;for(let Q of w||[]){let x=h.filter(de=>i.isoDate(de.t)===i.isoDate(Q.t)&&de.temp!=null);if(x.length<3)continue;let ue=x.reduce((de,b)=>b.temp>de.temp?b:de),Re=x.reduce((de,b)=>b.temp<de.temp?b:de);for(let[de,b,D]of[[ue,-6,"bottom"],[Re,13,"top"]]){let q=g(de.t),F=e.measureText(`${Math.round(de.temp)}\xB0`).width;if(q-F/2<u+4||q+F/2>u+c-se)continue;let z=U(de.temp)+b,K=D==="top"?z+9>A.y+A.h:z-9<A.y;e.textBaseline=K?D==="top"?"bottom":"top":D,e.fillStyle=Ee(de.temp),Ae(e,`${Math.round(de.temp)}\xB0`,q,K?U(de.temp)-b:z)}}e.restore(),gt(e,A,A.y-11,"temperature \xB0F",[{label:"actual",color:j[0]},{label:"feels like",short:"feels",color:j[1],dash:!0}],{short:"temp \xB0F"}),_.push({key:"temp",box:A,yOf:U})}if(C.pop){let A=C.pop,I=U=>A.y+A.h-N(U,0,100)/100*A.h;Ce(e,A,[50,100].map(U=>({v:U,y:I(U)})),U=>`${U}%`);let H=h.map(U=>[g(U.t),I(U.pop??0)]);e.save(),e.beginPath(),Pe(e,H),e.lineTo(H.at(-1)[0],A.y+A.h),e.lineTo(H[0][0],A.y+A.h),e.closePath();let G=e.createLinearGradient(0,A.y,0,A.y+A.h);G.addColorStop(0,V(j[4],.55)),G.addColorStop(1,V(j[4],.04)),e.fillStyle=G,e.fill(),e.restore(),$e(e,H,j[4],{width:1.6,glow:7}),e.save(),e.font=Se,e.textAlign="center",e.textBaseline="bottom",e.fillStyle=j[0];let W=-999,P=e.measureText("100%").width+6;for(let U=1;U<h.length-1;U++){let Y=h[U];if((Y.precip??0)<.02||(Y.precip??0)<=(h[U-1].precip??0)||(Y.precip??0)<(h[U+1].precip??0))continue;let B=g(Y.t),J=e.measureText(`${Y.precip.toFixed(2)}"`).width;B-W<46||B-J/2<u+4||B+J/2>u+c-P||(e.fillText(`${Y.precip.toFixed(2)}"`,B,I(Y.pop??0)-4),W=B)}e.restore(),be(e,A.x+2,A.y-11,"precip probability"),_.push({key:"pop",box:A,yOf:I})}if(C.wind){let A=C.wind,I=Math.max(...h.map(P=>P.gust??P.wind??0),10)*1.12,H=P=>A.y+A.h-N(P,0,I)/I*A.h;Ce(e,A,We(0,I,_e(A.h,2)).map(P=>({v:P,y:H(P)})),P=>String(Math.round(P)));let G=h.map(P=>[g(P.t),H(P.gust??P.wind??0)]);e.save(),e.beginPath(),Pe(e,G),e.lineTo(G.at(-1)[0],A.y+A.h),e.lineTo(G[0][0],A.y+A.h),e.closePath(),e.fillStyle=V(R.serious,.16),e.fill(),e.restore(),$e(e,G,V(R.serious,.85),{width:1.2,glow:5}),$e(e,h.map(P=>[g(P.t),H(P.wind??0)]),j[3],{width:1.8,glow:8}),e.save(),e.strokeStyle=V(j[3],.55),e.lineWidth=1;let W=Math.max(1,Math.round(h.length/(c/26)));for(let P=0;P<h.length;P+=W){let U=h[P];if(U.windDir==null)continue;let Y=g(U.t),B=A.y+A.h-5,J=(U.windDir-90+180)*Math.PI/180;e.save(),e.translate(Y,B),e.rotate(J),e.beginPath(),e.moveTo(-4,0),e.lineTo(4,0),e.moveTo(4,0),e.lineTo(1.5,-2),e.moveTo(4,0),e.lineTo(1.5,2),e.stroke(),e.restore()}e.restore(),gt(e,A,A.y-11,"wind mph",[{label:"sustained",short:"wind",color:j[3]},{label:"gusts",color:R.serious}],{short:"wind"}),_.push({key:"wind",box:A,yOf:H})}if(C.cloud){let A=C.cloud,I=h.length,H=Math.max(1,c/I),G=[["cloudHigh",V(j[4],.55)],["cloudMid",V(j[0],.5)],["cloudLow",V(ve,.45)]];h.forEach((W,P)=>{let U=u+P*c/I,Y=A.y,B=A.h/3;G.forEach(([J,se],Q)=>{let x=N((W[J]??0)/100,0,1);e.fillStyle=se,e.fillRect(U,Y+(B-2)*(1-x),Math.max(1,H-.5),(B-2)*x),Y+=B})}),e.save(),e.font=ye,e.textAlign="right",e.textBaseline="middle",["HIGH","MID","LOW"].forEach((W,P)=>{let U=A.y+A.h/3*(P+.5);e.fillStyle="rgba(22,33,47,.75)",e.fillRect(A.x+A.w-30,U-5,30,10),e.fillStyle=ae,Ae(e,W,A.x+A.w-2,U)}),e.restore(),be(e,A.x+2,A.y-11,"cloud decks %"),_.push({key:"cloud",box:A})}if(C.pressure){let A=C.pressure,I=h.map(P=>P.pressure).filter(P=>P!=null),H=Math.min(...I)-1,G=Math.max(...I)+1,W=P=>A.y+A.h-(P-H)/(G-H)*A.h;Ce(e,A,We(H,G,_e(A.h,2)).map(P=>({v:P,y:W(P)})),P=>(P*.02953).toFixed(2)),$e(e,h.filter(P=>P.pressure!=null).map(P=>[g(P.t),W(P.pressure)]),j[3],{width:1.8,glow:8}),be(e,A.x+2,A.y-11,"pressure inHg"),_.push({key:"pressure",box:A,yOf:W})}if(C.uv){let A=C.uv,I=W=>A.y+A.h-N(W,0,12)/12*A.h;Ce(e,A,[3,6,8,11].map(W=>({v:W,y:I(W)})),String);let H=h.length,G=Math.max(1,c/H-1);h.forEach((W,P)=>{let U=W.uv??0;if(U<=.05)return;let Y=u+P*c/H,B=U<3?R.good:U<6?R.warn:U<8?R.serious:U<11?R.crit:j[3];Ve(e,Y,I(U),G,A.y+A.h,V(B,.8))}),be(e,A.x+2,A.y-11,"uv index"),_.push({key:"uv",box:A,yOf:I})}if(C.cape){let A=C.cape,I=Math.max(...h.map(W=>W.cape??0),500)*1.1,H=W=>A.y+A.h-N(W,0,I)/I*A.h;Ce(e,A,We(0,I,_e(A.h,2)).map(W=>({v:W,y:H(W)})),W=>String(Math.round(W)));let G=h.map(W=>[g(W.t),H(W.cape??0)]);e.save(),e.beginPath(),Pe(e,G),e.lineTo(G.at(-1)[0],A.y+A.h),e.lineTo(G[0][0],A.y+A.h),e.closePath(),e.fillStyle=V(R.crit,.18),e.fill(),e.restore(),$e(e,G,R.crit,{width:1.6,glow:7}),be(e,A.x+2,A.y-11,"CAPE J/kg"),_.push({key:"cape",box:A,yOf:H})}if(k){e.save(),e.font=Se,e.fillStyle=ae,e.textAlign="center",e.textBaseline="top";let A=(y.hi-y.lo)/36e5,I=A>200?24:A>96?12:A>40?6:A>16?3:1,H=e.measureText("00:00").width+8,G=c/Math.max(A,1),W=[1,3,6,12,24,48].filter(P=>P>=I).find(P=>P*G>=H)??48;for(let P of h){let U=i.hourOfDay(P.t);if(Math.abs(U-Math.round(U))>.01||Math.round(U)%W!==0)continue;let Y=g(P.t);Y<u+10||Y>u+c-10||e.fillText(i.hm(P.t),Y,o-a+4)}e.restore()}if(v!=null&&v>=y.lo&&v<=y.hi&&Ot(e,g(v),O,V(R.good,.9),"NOW",{dash:[3,3]}),S!=null&&Math.abs(S-(v??S))>9e4&&S>=y.lo&&S<=y.hi&&Ot(e,g(S),O,j[1],null),n&&n.x>u&&n.x<u+c){let A=E(n.x),I=Yo(h,A);if(I){let H=g(I.t);e.save(),e.strokeStyle="rgba(255,255,255,.35)",e.setLineDash([2,3]),e.lineWidth=1,e.beginPath(),e.moveTo(Math.round(H)+.5,p),e.lineTo(Math.round(H)+.5,p+O.h),e.stroke(),e.restore();for(let W of _){if(!W.yOf)continue;let P=W.key==="temp"?I.temp:W.key==="pop"?I.pop??0:W.key==="wind"?I.wind:W.key==="pressure"?I.pressure:W.key==="uv"?I.uv:W.key==="cape"?I.cape:null;P!=null&&(e.save(),e.fillStyle=ve,e.shadowColor=j[0],e.shadowBlur=5,e.beginPath(),e.arc(H,W.yOf(P),3.5,0,Math.PI*2),e.fill(),e.restore())}let G=[`${i.weekday(I.t)} ${i.hm(I.t)}|`];C.temp&&(G.push(`TEMP|${Z.temp(I.temp)}`),G.push(`FEELS|${Z.temp(I.feels)}`)),C.pop&&(G.push(`RAIN CHANCE|${Z.pct(I.pop)}`),(I.precip??0)>.001&&G.push(`AMOUNT|${Z.inches(I.precip)}"`)),C.wind&&G.push(`WIND|${Z.wind(I.wind)} ${me(I.windDir)}`),C.pressure&&G.push(`PRESSURE|${Z.pressure(I.pressure)}`),C.uv&&G.push(`UV|${I.uv?.toFixed(1)??"--"}`),C.cape&&G.push(`CAPE|${Math.round(I.cape??0)}`),G.push(`SKY|${Qe(Math.round(I.code??0)).label}`),et(e,H,n.y,G,t,o,"#3fd0d8",{pin:n.coarse})}}return{xOf:g,tOf:E,boxes:C}}function Yo(e,t){let o=null,n=1/0;for(let s of e){let l=Math.abs(s.t-t);l<n&&(n=l,o=s)}return o}function xo(e,t,o,n,{rows:s,tf:l,now:w}){if(!s?.length)return;let y=4,S=34,v=16,i=20,f={x:y,y:v,w:t-y-S,h:o-v-i};if(f.w<30||f.h<20)return;let k=Math.min(...s.map($=>$.min)),u=Math.max(...s.map($=>$.max)),d=k-2,p=u+2,a=$=>f.x+($-s[0].t)/(s.at(-1).t-s[0].t)*f.w,c=$=>f.y+f.h-($-d)/(p-d)*f.h;Ce(e,f,We(d,p,_e(f.h,4)).map($=>({v:$,y:c($)})),$=>`${Math.round($)}\xB0`),e.save(),e.beginPath(),s.forEach(($,m)=>m?e.lineTo(a($.t),c($.max)):e.moveTo(a($.t),c($.max)));for(let $=s.length-1;$>=0;$--)e.lineTo(a(s[$].t),c(s[$].min));e.closePath();let h=e.createLinearGradient(f.x,0,f.x+f.w,0);h.addColorStop(0,V(j[0],.3)),h.addColorStop(1,V(j[0],.1)),e.fillStyle=h,e.fill(),e.strokeStyle=V(j[0],.35),e.lineWidth=1,e.stroke(),e.restore(),$e(e,s.map($=>[a($.t),c($.mean)]),j[0],{width:2,glow:10}),e.save(),e.strokeStyle=lo,e.font=Se,e.fillStyle=ae,e.textAlign="center",e.textBaseline="top";let g="",E=e.measureText("WED").width+8,M=-1e9;for(let $ of s){let m=l.isoDate($.t);if(m===g)continue;g=m;let T=a($.t);e.beginPath(),e.moveTo(T+.5,f.y),e.lineTo(T+.5,f.y+f.h),e.stroke(),!(T<f.x+12||T>f.x+f.w-12||T-M<E)&&(e.fillText(l.weekday($.t).toUpperCase(),T,o-i+5),M=T)}if(e.restore(),w>=s[0].t&&w<=s.at(-1).t&&Ot(e,a(w),f,V(R.good,.9),"NOW",{dash:[3,3]}),gt(e,f,3,"model agreement \xB0F",[{label:"ensemble mean",short:"mean",color:j[0]},{label:"model range",short:"range",color:V(j[0],.35)}],{short:"model spread \xB0F"}),n&&n.x>f.x&&n.x<f.x+f.w){let $=s[0].t+(n.x-f.x)/f.w*(s.at(-1).t-s[0].t),m=Yo(s,$);if(m){let T=a(m.t);e.save(),e.strokeStyle="rgba(255,255,255,.3)",e.setLineDash([2,3]),e.beginPath(),e.moveTo(T+.5,f.y),e.lineTo(T+.5,f.y+f.h),e.stroke(),e.restore();let L=m.spread<2?"HIGH":m.spread<5?"MODERATE":m.spread<9?"LOW":"VERY LOW";et(e,T,n.y,[`${l.weekday(m.t)} ${l.hm(m.t)}|`,`MEAN|${Z.tempP(m.mean)}`,`RANGE|${Z.temp(m.min)}\u2013${Z.temp(m.max)}`,`SPREAD|${m.spread.toFixed(1)}\xB0`,`CONFIDENCE|${L}`,m.precipAgree!=null?`MODELS WET|${Math.round(m.precipAgree*100)}%`:null].filter(Boolean),t,o,"#3fd0d8",{pin:n.coarse})}}}function Zo(e,t,o,n,{days:s,climate:l,tf:w,doyOf:y}){if(!s?.length||!l?.doy?.length)return;let S=4,v=34,i=16,f=20,k={x:S,y:i,w:t-S-v,h:o-i-f};if(k.w<40||k.h<30)return;let u=s.map(m=>{let T=l.doy[y(m.t)];return T?{...m,c:T}:null}).filter(Boolean);if(!u.length)return;let d=u.flatMap(m=>[m.c.recordHigh,m.c.recordLow,m.tmax,m.tmin]).filter(m=>m!=null),p=Math.min(...d)-3,a=Math.max(...d)+3,c=u.length,h=k.w/c,g=m=>k.x+h*(m+.5),E=m=>k.y+k.h-(m-p)/(a-p)*k.h;Ce(e,k,We(p,a,_e(k.h,4)).map(m=>({v:m,y:E(m)})),m=>`${Math.round(m)}\xB0`),e.save(),e.beginPath(),u.forEach((m,T)=>T?e.lineTo(g(T),E(m.c.recordHigh)):e.moveTo(g(T),E(m.c.recordHigh)));for(let m=c-1;m>=0;m--)e.lineTo(g(m),E(u[m].c.recordLow));e.closePath(),e.fillStyle="rgba(255,255,255,.045)",e.fill(),e.restore(),e.save(),e.beginPath(),u.forEach((m,T)=>T?e.lineTo(g(T),E(m.c.normalHigh)):e.moveTo(g(T),E(m.c.normalHigh)));for(let m=c-1;m>=0;m--)e.lineTo(g(m),E(u[m].c.normalLow));e.closePath(),e.fillStyle="rgba(141,154,171,.20)",e.fill(),e.strokeStyle="rgba(141,154,171,.45)",e.setLineDash([3,3]),e.lineWidth=1,e.stroke(),e.restore();let M=Math.min(15,h*.42);u.forEach((m,T)=>{if(m.tmax==null||m.tmin==null)return;let L=(m.tmax-m.c.normalHigh+(m.tmin-(m.c.normalLow??m.c.normalHigh)))/2,C=N(Math.abs(L)/15,0,1),O=L>=0?Be("#8d9aab","#f2b45a",C):Be("#8d9aab","#7fb2f0",C),_=g(T)-M/2,A=E(m.tmax),I=E(m.tmin);e.save(),e.shadowColor=O,e.shadowBlur=5,e.fillStyle=O;let H=Math.min(4,M/2);e.beginPath(),e.moveTo(_,I-H),e.lineTo(_,A+H),e.quadraticCurveTo(_,A,_+H,A),e.lineTo(_+M-H,A),e.quadraticCurveTo(_+M,A,_+M,A+H),e.lineTo(_+M,I-H),e.quadraticCurveTo(_+M,I,_+M-H,I),e.lineTo(_+H,I),e.quadraticCurveTo(_,I,_,I-H),e.closePath(),e.fill(),e.restore(),m.tmax>=m.c.recordHigh&&(e.save(),e.fillStyle=R.crit,e.font=Se,e.textAlign="center",e.textBaseline="bottom",Ae(e,"REC",g(T),E(m.tmax)-4),e.restore())}),e.save(),e.font=Se,e.fillStyle=ae,e.textAlign="center",e.textBaseline="top";let $=Rt(c,k.w,e.measureText("WED").width,{least:c>12?2:1});if(u.forEach((m,T)=>{T%$||Oe(e,w.weekday(m.t).toUpperCase(),g(T),o-f+5,0,t)}),e.restore(),gt(e,k,3,"forecast vs climate record \xB0F",[{label:"forecast",color:"#f2b45a"},{label:"normal",color:"rgba(141,154,171,.7)",dash:!0},{label:"record range",short:"record",color:"rgba(255,255,255,.2)"}],{short:"climate record \xB0F"}),n&&n.x>k.x&&n.x<k.x+k.w){let m=N(Math.floor((n.x-k.x)/h),0,c-1),T=u[m],L=T.tmax-T.c.normalHigh;et(e,g(m),n.y,[`${w.weekday(T.t)} ${w.monthDay(T.t)}|`,`FORECAST|${Z.temp(T.tmin)} \u2013 ${Z.temp(T.tmax)}`,`NORMAL|${Z.temp(T.c.normalLow)} \u2013 ${Z.temp(T.c.normalHigh)}`,`HIGH vs NORMAL|${Z.signed(L)}\xB0`,`RECORD HIGH|${Z.temp(T.c.recordHigh)} (${T.c.recordHighYear})`,`RECORD LOW|${Z.temp(T.c.recordLow)} (${T.c.recordLowYear})`],t,o,L>=0?"#f2b45a":"#7fb2f0",{pin:n.coarse})}}function Jo(e,t,o,n,{rows:s,tf:l,now:w}){if(!s?.length)return;let y=4,S=22,v=14,i=18,f={x:y,y:v,w:t-y-S,h:o-v-i};if(f.w<30)return;let k=s.length,u=Math.max(2,f.w/k-2),d=Math.max(5.6,Math.ceil(Math.max(...s.map(g=>g.kp))+.8)),p=g=>f.y+f.h-N(g,0,d)/d*f.h;Ce(e,f,[3,5,7].filter(g=>g<=d).map(g=>({v:g,y:p(g)})),String),e.save(),e.strokeStyle=V(R.serious,.5),e.setLineDash([4,3]),e.lineWidth=1,e.beginPath(),e.moveTo(f.x,p(5)),e.lineTo(f.x+f.w,p(5)),e.stroke(),e.setLineDash([]),e.font=ye,e.fillStyle=V(R.serious,.8),e.textAlign="left",e.textBaseline="bottom",Ae(e,"STORM",f.x+3,p(5)-2),e.restore(),s.forEach((g,E)=>{let M=g.kp<3?j[0]:g.kp<5?R.good:g.kp<6?R.warn:g.kp<7?R.serious:R.crit,$=f.x+E*f.w/k;Ve(e,$,p(Math.min(g.kp,d)),u,f.y+f.h,V(M,g.observed==="observed"?.9:.55))}),e.save(),e.font=Se,e.fillStyle=ae,e.textAlign="center",e.textBaseline="top";let a="",c=e.measureText("WED").width+8,h=-1e9;if(s.forEach((g,E)=>{let M=l.isoDate(g.t);if(M===a)return;a=M;let $=f.x+E*f.w/k+u/2;$<f.x+10||$>f.x+f.w-10||$-h<c||(e.fillText(l.weekday(g.t).toUpperCase(),$,o-i+4),h=$)}),e.restore(),be(e,f.x+2,2,"planetary K index"),n&&n.x>f.x&&n.x<f.x+f.w){let g=N(Math.floor((n.x-f.x)/f.w*k),0,k-1),E=s[g];et(e,f.x+g*f.w/k+u/2,n.y,[`${l.weekday(E.t)} ${l.hm(E.t)}|`,`Kp|${E.kp.toFixed(2)}`,`STATUS|${(E.observed||"predicted").toUpperCase()}`],t,o,j[3],{pin:n.coarse})}}var Ft=(e,t,o)=>o>=6&&o<22;function ie(e,t,o,n,s){return e==null?.5:e>=o&&e<=n?1:e<o?t>=o?1:N((e-t)/(o-t),0,1):s<=n?1:N((s-e)/(s-n),0,1)}var zt={walk:{label:"WALK",icon:"\u{1F6B6}",color:"#3fd0d8",hours:Ft,score(e){return[["temperature",ie(e.feels??e.temp,30,50,75,95),.3],["dry",1-N((e.pop??0)/100,0,1)*.9,.24],["wind",ie(e.wind,-1,0,12,30),.12],["humidity",ie(e.dew,-20,20,60,76),.1],["UV",ie(e.uv,-1,0,5,11),.07],["air quality",ie(e.air?.aqi,-1,0,50,160),.07],["daylight",e.isDay?1:.5,.1]]}},bike:{label:"BIKE",icon:"\u{1F6B2}",color:"#8fdc6a",hours:Ft,score(e){return[["temperature",ie(e.feels??e.temp,25,58,78,98),.26],["dry",1-N((e.pop??0)/100,0,1),.22],["wind",ie(e.gust??e.wind,-1,0,8,24),.24],["visibility",ie(e.vis,0,8e3,1/0,1/0),.08],["UV",ie(e.uv,-1,0,5,11),.05],["air quality",ie(e.air?.aqi,-1,0,50,150),.05],["daylight",e.isDay?1:.35,.1]]}},grill:{label:"GRILL",icon:"\u{1F525}",color:"#f2b45a",hours:Ft,score(e){return[["dry",1-N((e.pop??0)/100,0,1)*1,.34],["temperature",ie(e.temp,35,62,88,104),.24],["wind",ie(e.wind,-1,0,10,22),.24],["daylight or dusk",e.isDay?1:.55,.1],["humidity",ie(e.dew,-20,20,64,78),.08]]}},stargaze:{label:"STARGAZE",icon:"\u2726",color:"#b39dfa",hours:e=>!e.isDay,score(e,t){return[["darkness",e.isDay?0:1,.26],["clear sky",1-N((e.cloud??0)/100,0,1),.32],["no moon",1-N(t?.moonFraction??.5,0,1)*(t?.moonUp?1:.15),.18],["transparency",ie(e.vis,0,2e4,1/0,1/0),.1],["low humidity",ie(e.rh,-1,0,65,100),.08],["calm",ie(e.wind,-1,0,8,28),.06]]}},photo:{label:"PHOTO",icon:"\u25CE",color:"#f07aa6",hours:(e,t)=>!!e.isDay||t?.sunAltDeg!=null&&t.sunAltDeg>-8,score(e,t){let o=t?.sunAltDeg==null?.4:Math.exp(-Math.pow((t.sunAltDeg-3)/7,2)),n=1-Math.abs((e.cloud??50)/100-.45)*1.6;return[["golden light",N(o,0,1),.4],["sky texture",N(n,0,1),.26],["dry",1-N((e.pop??0)/100,0,1)*.7,.18],["clarity",ie(e.vis,0,15e3,1/0,1/0),.16]]}},swim:{label:"SWIM",icon:"\u{1F3CA}",color:"#7fb2f0",hours:(e,t,o)=>!!e.isDay&&o>=7&&o<20,score(e){let t=[95,96,99].includes(Number(e.code));return[["temperature",ie(e.feels??e.temp,65,80,95,105),.34],["dry",1-N((e.pop??0)/100,0,1),.18],["no thunder",t?0:1,.1],["sunshine",ie(e.cloud,-1,0,40,100),.12],["wind",ie(e.wind,-1,0,10,25),.12],["UV",ie(e.uv,-1,2,7,11),.08],["air quality",ie(e.air?.aqi,-1,0,50,150),.06]]}},openWindows:{label:"OPEN UP",icon:"\u{1FA9F}",color:"#5cd6bc",hours:Ft,score(e){return[["comfortable air",ie(e.temp,40,62,76,90),.34],["dry air",ie(e.dew,-20,25,58,70),.24],["clean air",ie(e.air?.aqi,-1,0,50,130),.22],["no rain",1-N((e.pop??0)/100,0,1),.12],["calm",ie(e.wind,-1,0,14,34),.08]]}}},Bt=Object.keys(zt),_t=e=>zt[e];function Wt(e,t,o){let n=zt[e];if(!n||!t)return null;let s=n.score(t,o),l=0;for(let[,S,v]of s)l+=N(S,0,1)*v;let w=null,y=0;for(let[S,v,i]of s){let f=(1-N(v,0,1))*i;f>y&&(y=f,w=S)}return{score:Math.round(N(l,0,1)*100),limiter:y>.06?w:null,parts:s.map(([S,v,i])=>({name:S,value:N(v,0,1),weight:i}))}}function Qn(e,t){let o=e.fmt?.hourOfDay?e.fmt.hourOfDay(t):NaN;return Number.isFinite(o)?o:new Date(t).getHours()}function Qo(e,t,o=36){let n=zt[e];if(!n)return[];let s=Date.now(),l=s+o*36e5;return t.hours.filter(w=>w.t>=s-18e5&&w.t<=l).map(w=>{let y=ea(t,w.t),S=n.hours?!!n.hours(w,y,Qn(t,w.t)):!0;return{t:w.t,eligible:S,...Wt(e,{...w,air:Xn(t,w.t)},y)}})}function Xo(e,t,{hours:o=36,at:n=90}={}){let l=Qo(e,t,o).filter(w=>w.eligible);return{great:l.filter(w=>w.score>=n).length,eligible:l.length}}function Ut(e,t,{hours:o=36,limit:n=3,minScore:s=55}={}){let l=Qo(e,t,o);if(!l.length)return[];for(let v of l)v.eligible||(v.score=-1/0);let w=12,y=new Array(l.length).fill(!1),S=[];for(let v=0;v<n;v++){let i=-1;for(let a=0;a<l.length;a++)y[a]||l[a].score<s||(i<0||l[a].score>l[i].score)&&(i=a);if(i<0)break;let f=l[i].score,k=Math.max(s,f-w),u=i,d=i;for(;u-1>=0&&!y[u-1]&&l[u-1].score>=k;)u--;for(;d+1<l.length&&!y[d+1]&&l[d+1].score>=k;)d++;for(let a=u;a<=d;a++)y[a]=!0;let p=0;for(let a=u;a<=d;a++)p+=l[a].score;S.push({start:l[u].t,end:l[d].t+36e5,peakAt:l[i].t,peak:f,avg:Math.round(p/(d-u+1)),hours:d-u+1,limiter:l[i].limiter,parts:l[i].parts})}return S.sort((v,i)=>i.peak-v.peak||v.start-i.start)}function Xn(e,t){if(!e.air?.length)return null;let o=null,n=1/0;for(let s of e.air){let l=Math.abs(s.t-t);l<n&&(n=l,o=s)}return n<36e5*2?o:null}function ea(e,t){let o=e.frame(t);return o?{sunAltDeg:o.sun.altDeg,moonFraction:o.moon.fraction,moonUp:o.moon.altDeg>0}:{}}function vt(e){let t=Date.now(),o=t+6*36e5,n=(e.min15?.length?e.min15:e.hours).filter(S=>S.t>=t-9e5&&S.t<=o);if(n.length<2)return null;let s=.002,l=(n[0].precip??0)>=s,w=null;for(let S of n)if((S.precip??0)>=s!==l){w=S;break}let y=n.reduce((S,v)=>(v.precip??0)>(S.precip??0)?v:S,n[0]);return{raining:l,changeAt:w?.t??null,minutes:w?Math.round((w.t-t)/6e4):null,peak:y.precip??0,peakAt:y.t,resolution:e.min15?.length?15:60,series:n.map(S=>({t:S.t,p:S.precip??0}))}}function en(e,t){return e?e.raining?e.minutes!=null?`Rain now \u2014 easing in about ${e.minutes} min`:"Rain now \u2014 no let-up in the next 6 hours":e.minutes!=null&&e.minutes<=240?`${e.peak>.08?"Heavy rain":e.peak>.02?"Rain":"Light rain"} starting in ${e.minutes} min (${t.hm(e.changeAt)})`:null:null}var Gt=e=>e<0?0:e>1?1:e,ge=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function tn(e,t,o={},n={}){if(!t)return null;let s=ge(t.temperature_2m),l=String(o.temperature_2m||"").includes("F"),w=ge(t.wind_speed_10m),y=/mp\/?h|mph/i.test(String(o.wind_speed_10m||"")),S=ge(t.precipitation),v=/inch/i.test(String(o.precipitation||""));return{name:e,tempRaw:s,tempC:s===null?null:l?(s-32)/1.8:s,windKmh:w===null?null:y?w*1.609344:w,precipMm:S===null?null:v?S*25.4:S,cloudPct:ge(t.cloud_cover),night:t.is_day===0,...n}}function yt(e){let t=ge(e?.tempC);if(t===null)return null;let o=Gt(1-Math.abs(t-21)/18),n=Gt(1-(ge(e?.precipMm)??0)/2),s=Gt(1-(ge(e?.cloudPct)??0)/100*.6),l=Gt(1-Math.max(0,(ge(e?.windKmh)??0)-20)/40);return Math.round(100*(.4*o+.3*n+.2*s+.1*l))}function qt(e){let t=ge(e?.precipMm)??0,o=ge(e?.cloudPct),n=ge(e?.windKmh)??0;return t>=.5?"raining":t>0?"drizzling":n>=20+40/2?"blowing hard":o===null?null:o<=15?"clear":o<=45?"some cloud":o<=80?"cloudy":"overcast"}function ta(e,t){let o=yt(e),n=yt(t);if(n===null)return null;let s=ge(t.tempC)!==null&&ge(e?.tempC)!==null?Math.round(t.tempC-e.tempC):null,l=ge(t.tempRaw)!==null&&ge(e?.tempRaw)!==null?Math.round(t.tempRaw-e.tempRaw):null;return{name:t.name,score:n,deltaScore:o===null?null:n-o,deltaC:s,deltaShown:l===null?s:l,better:o!==null&&n>o,headline:qt(t),tempC:ge(t.tempC),localHour:ge(t.localHour),night:t.night===!0}}function on(e,t){let o=(Array.isArray(t)?t:[]).map(n=>ta(e,n)).filter(Boolean);return o.sort((n,s)=>s.score-n.score||(s.deltaC??0)-(n.deltaC??0)||String(n.name).localeCompare(String(s.name))),o}function co(e){if(!e)return"";let t=[],o=e.deltaShown??e.deltaC;return o!==null&&o!==0?t.push(`${Math.abs(o)}\xB0 ${o>0?"warmer":"colder"}`):o===0&&t.push("same temperature"),e.headline&&t.push(e.headline),e.night&&e.localHour!==null&&t.push(`${e.localHour}:00 there`),t.join(", ")}function nn(e,t){if(!t.length)return"Nowhere to compare against right now.";let o=t.filter(l=>l.better);if(!o.length)return`Nowhere on the list beats ${e} right now.`;let n=o[0],s=o.length-1;return`${n.name} is better than ${e} right now \u2014 ${co(n)}.`+(s>0?` So ${s===1?"is one other":`are ${s} others`}.`:"")}var oa="../countdown/stats.json",an=[{place:"San Francisco, California",lat:37.7749,lon:-122.4194},{place:"Vancouver, Canada",lat:49.2497,lon:-123.1193},{place:"Grants Pass, Oregon",lat:42.4393,lon:-123.3307}],na=600*1e3;function sn(e){e.className="panel elsewhere",e.innerHTML=`
    <div class="hd">ELSEWHERE<span class="rule"></span><span class="val" id="ew-count">\u2014</span></div>
    <div class="body">
      <div class="ew-list" id="ew-list"><div class="ew-empty">Looking\u2026</div></div>
      <p class="ew-say" id="ew-say"></p>
    </div>`;let t=k=>e.querySelector(`#${k}`),o=null,n=0,s=[],l="",w=!1;async function y(){if(o)return o;try{let k=await(await fetch(new URL(oa,location.href),{cache:"no-cache"})).json(),u=Array.isArray(k?.trips)?k.trips:[],d=new Date,p=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,a=h=>typeof h.date!="string"||(h.date.length===7?`${h.date}-01`:h.date)<=p,c=new Set;o=u.filter(h=>h&&typeof h.lat=="number"&&typeof h.lon=="number"&&a(h)&&typeof h.place=="string"&&!c.has(h.place)&&c.add(h.place)),o.length||(console.warn("ELSEWHERE: trip list had no usable coordinates; using the fallback"),o=an)}catch(k){console.warn("ELSEWHERE: could not read the trip list, using the fallback \u2014",k.message),o=an}return o}async function S(k){try{let d=(await ce.bundle(k.lat,k.lon))?.forecast?.data;if(!d?.current)return null;let p=Number(String(d.current.time||"").slice(11,13));return tn(k.place,d.current,d.current_units,{localHour:Number.isFinite(p)?p:null})}catch{return null}}async function v(){let k=r.loc;if(!k||w)return;let u=`${k.lat?.toFixed(2)},${k.lon?.toFixed(2)}`;if(!(u===l&&Date.now()-n<na)){w=!0;try{let d=await y(),p=await S({place:k.name||"here",lat:k.lat,lon:k.lon});if(!p)return;let a=(await Promise.all(d.map(S))).filter(Boolean);s=on(p,a),l=u,n=Date.now(),i(p),f(p)}finally{w=!1}}}function i(k){let u=yt(k),d=s.filter(c=>c.better);if(t("ew-count").textContent=s.length?d.length?`${d.length} better`:"none better":"\u2014",!s.length){t("ew-list").innerHTML='<div class="ew-empty">No places to compare.</div>',t("ew-say").textContent="";return}let p=c=>`
      <div class="ew-row${c.better?" is-better":""}">
        <span class="ew-name">${te(c.name)}</span>
        <span class="ew-what">${te(co(c))}</span>
      </div>`,a=`
      <div class="ew-here">
        <span class="ew-name">${te(k.name)}</span>
        <span class="ew-what">here \xB7 ${te(qt(k)||"")}${Number.isFinite(u)?` \xB7 ${u}/100`:""}</span>
      </div>`;t("ew-list").innerHTML=d.map(p).join("")+a+s.filter(c=>!c.better).map(p).join(""),t("ew-say").textContent=nn(k.name,s)}async function f(k){try{let u={here:k.name,hereSky:qt(k),hereScore:yt(k),rows:s.map(a=>({name:a.name,delta:a.deltaShown??a.deltaC,sky:a.headline,better:a.better,night:a.night}))},d=btoa(unescape(encodeURIComponent(JSON.stringify(u)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),p=await ce.elsewhere(d);p?.text&&l&&(t("ew-say").textContent=p.text)}catch{}}return{update(){v()},onHide(){}}}function rn(e){e.className="view deck active",e.innerHTML=`
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
  `;let t=a=>e.querySelector("#"+a),o=sn(t("d-elsewhere")),n=le(t("d-meteo"),(a,c,h,g)=>{let E=Date.now();Ht(a,c,h,g,{hours:r.hours,days:r.days,tf:r.fmt,span:{lo:r.cursor-12*36e5,hi:r.cursor+36*36e5},cursor:r.cursor,now:E,panels:["temp","pop","wind"]})},{onPick:({x:a,w:c})=>{let h=r.cursor-432e5,g=r.cursor+36*36e5,E=c-34;r.playing=!1,r.scrubTo(h+(a-4)/E*(g-h))}}),s=le(t("d-spark"),(a,c,h)=>{let g=r.hours.filter(M=>M.t>=r.cursor-36e5&&M.t<=r.cursor+864e5);if(g.length<2)return;let E=Wo(a,{x:0,y:4,w:c,h:h-14},g.map(M=>M.temp),{color:j[0],glow:9});a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=ae,a.textAlign="center",a.textBaseline="bottom";for(let M=0;M<g.length;M+=6)Oe(a,r.fmt.hour(g[M].t).replace(/\s/g,""),M/(g.length-1)*c,h,0,c);a.restore(),E?.length&&(a.save(),a.fillStyle=ve,a.shadowColor=j[0],a.shadowBlur=5,a.beginPath(),a.arc(E[1]?.[0]??E[0][0],E[1]?.[1]??E[0][1],3,0,Math.PI*2),a.fill(),a.restore())}),l=le(t("d-moondisc"),(a,c,h)=>{let g=r.frame();g&&Nt(a,c/2,h/2,Math.max(10,Math.min(c,h)/2-3),g.moon.phase,g.moon.fraction)}),w=le(t("d-nc"),(a,c,h)=>{let g=vt(r);if(!g?.series?.length)return;let E=Math.max(...g.series.map(m=>m.p),.02),M=g.series.length,$=Math.max(1,c/M-.6);g.series.forEach((m,T)=>{let L=T*c/M,C=m.p>0?Math.max(1.5,m.p/E*h):0;C&&Ve(a,L,h-C,$,h,V(m.p>.08?R.crit:m.p>.02?j[0]:j[4],.9),2)}),a.save(),a.strokeStyle="rgba(255,255,255,.10)",a.beginPath(),a.moveTo(0,h-.5),a.lineTo(c,h-.5),a.stroke(),a.restore()}),y=[["g-wind",(a,c,h)=>{let g=r.frame(),E=Math.min(c,h)/2-16;Uo(a,c/2,h/2-4,Math.max(14,E),{dir:g?.windDir,speed:g?.wind,gust:g?.gust,color:j[3]})}],["g-hum",(a,c,h)=>{let g=r.frame(),E=Math.min(c,h)/2-18;je(a,c/2,h/2-6,Math.max(14,E),{value:g?.rh,min:0,max:100,color:j[4],label:"humidity",unit:"%",sub:g?qe(g.dew).name:""})}],["g-pres",(a,c,h)=>{let g=r.frame(),E=Math.min(c,h)/2-18,M=g?.pressure?g.pressure*.029529983:null;je(a,c/2,h/2-6,Math.max(14,E),{value:M,min:28.5,max:31,color:j[3],label:"pressure",unit:"inHg",decimals:2,sub:S()})}],["g-uv",(a,c,h)=>{let g=r.frame(),E=Math.min(c,h)/2-18;je(a,c/2,h/2-6,Math.max(14,E),{value:g?.uv,min:0,max:12,color:Ge(g?.uv).color,label:"uv index",unit:"index",decimals:1,sub:Ge(g?.uv).name,bands:[{from:0,to:3,color:R.good},{from:3,to:6,color:R.warn},{from:6,to:8,color:R.serious},{from:8,to:11,color:R.crit},{from:11,to:12,color:j[3]}]})}],["g-aqi",(a,c,h)=>{let E=r.frame()?.air?.aqi??r.airNow?.aqi,M=ze(E),$=Math.min(c,h)/2-18;je(a,c/2,h/2-6,Math.max(14,$),{value:E,min:0,max:200,color:M.color,label:"air quality",unit:"US AQI",sub:M.name.length>12?"SENSITIVE":M.name,bands:[{from:0,to:50,color:R.good},{from:50,to:100,color:R.warn},{from:100,to:150,color:R.serious},{from:150,to:200,color:R.crit}]})}],["g-vis",(a,c,h)=>{let g=r.frame(),E=g?.vis!=null?g.vis/1609.344:null,M=Math.min(c,h)/2-18;je(a,c/2,h/2-6,Math.max(14,M),{value:E==null?null:Math.min(E,10),min:0,max:10,color:j[0],label:"visibility",unit:"miles",decimals:1,sub:E==null?"":E>=9?"CLEAR":E>=3?"HAZY":E>=1?"POOR":"FOG"})}]].map(([a,c])=>le(t(a),c));function S(){let a=r.cursor,c=r.hours.find(E=>E.t>=a-3*36e5),h=r.hours.find(E=>E.t>=a);if(!c?.pressure||!h?.pressure)return"";let g=(h.pressure-c.pressure)*.029529983;return Math.abs(g)<.02?"STEADY":g>0?`RISING ${g.toFixed(2)}`:`FALLING ${Math.abs(g).toFixed(2)}`}function v(){let a=r.frame();if(!a)return;let c=r.fmt;t("d-temp").innerHTML=`${a.temp==null?"--":Math.round(a.temp)}<sup>\xB0F</sup>`,t("d-cond").textContent=a.wx.label,t("d-glyph").textContent=eo(Math.round(a.code??0),a.isDay>.5),t("d-feels").textContent=Z.temp(a.feels),t("d-dew").textContent=Z.temp(a.dew),t("d-obs").textContent=r.atNow?`LIVE \xB7 ${Xt(r.lastFetch)}`:`PROJECTED \xB7 ${c.hm(r.cursor)}`;let h=r.observed,g=t("d-obsline");if(r.atNow&&h?.tempF!=null){let P=a.temp!=null?a.temp-h.tempF:null;g.innerHTML=`observed <b>${Math.round(h.tempF)}\xB0</b><span> \xB7 ${te(h.name||h.station)} ${h.distanceMi} mi \xB7 ${Xt(Date.parse(h.time))}</span>`+(P!=null&&Math.abs(P)>=1.5?`<em> \xB7 model runs ${Z.signed(P,0)}\xB0</em>`:""),g.style.display=""}else g.style.display="none";let E=a.day;t("d-hi").textContent=Z.temp(E?.tmax),t("d-lo").textContent=Z.temp(E?.tmin);let M=t("d-anom"),$=r.climate?.doy?.[p(r.cursor)];if($&&E?.tmax!=null){let P=E.tmax-$.normalHigh;M.textContent=`${Z.signed(P,1)}\xB0`,M.style.color=Math.abs(P)<2?pe:P>0?"#f2b45a":"#7fb2f0"}else M.textContent="--",M.style.color="";let m=r.sunTimesFor();t("d-sunrise").textContent=c.hm(m.sunrise),t("d-sunset").textContent=c.hm(m.sunset),t("d-daylight").textContent=E?.daylight?at(E.daylight):"--";let T=r.alerts,L=t("d-alertPanel");L.style.display=T.length?"":"none",t("d-alertN").textContent=String(T.length),t("d-alerts").innerHTML=T.slice(0,4).map(P=>`
      <div class="alert-item" style="--ac:${pt(P.event,P.severity)}">
        <b>${te(P.event||"Alert")}</b>
        <span>until ${c.weekday(P.expires||P.ends)} ${c.hm(P.expires||P.ends)}</span>
      </div>`).join("");let C=vt(r),O=en(C,c),_=t("d-ncline");if(O)_.textContent=O,_.className="nowcast-line wet";else{let P=r.hours.find(U=>U.t>Date.now()&&(U.pop??0)>=40);_.textContent=P?`Dry for 6+ hours. Next real chance ${c.weekday(P.t)} ${c.hm(P.t)} (${Math.round(P.pop)}%).`:"Dry. No meaningful precipitation in the forecast window.",_.className="nowcast-line"}t("d-ncres").textContent=C?`${C.resolution}-MIN`:"\u2014";let A=a.moon,I=r.moonTimesFor();t("d-moonname").textContent=`${Math.round(A.fraction*100)}% LIT`,t("d-sunmoon").innerHTML=`
      <dl style="margin:0">
        ${u("Sun altitude",`${a.sun.altDeg.toFixed(1)}\xB0 ${me(a.sun.compass)}`)}
        ${u("Golden hour",`${c.hm(m.goldenHour)} \u2013 ${c.hm(m.sunset)}`)}
        ${u("Blue hour",`${c.hm(m.sunset)} \u2013 ${c.hm(m.dusk)}`)}
        ${u("Astro dark",isNaN(+m.night)?"none tonight":c.hm(m.night))}
        ${u("Moon",`${d(A.phase)}`)}
        ${u("Moon alt",`${A.altDeg.toFixed(1)}\xB0 ${me(A.compass)}`)}
        ${u("Moonrise",I.rise?c.hm(I.rise):"\u2014")}
        ${u("Moonset",I.set?c.hm(I.set):"\u2014")}
      </dl>`;let H=Lt(a.wind);t("n-wind").textContent=`${H.name} \xB7 from ${me(a.windDir)}`,t("n-hum").textContent=qe(a.dew).note,t("n-pres").textContent=a.pressure?`${Math.round(a.pressure)} hPa`:"";let G=Et(a.uv,r.settings.skinType);t("n-uv").textContent=G==null?"no burn risk":G>180?"burn risk negligible":`burn in ~${G} min`;let W=a.air?.aqi??r.airNow?.aqi;t("n-aqi").textContent=a.air?.pm25!=null?`PM2.5 ${a.air.pm25.toFixed(1)} \xB5g/m\xB3`:W!=null?"":"no data",t("n-vis").textContent=a.vis!=null?`${(a.vis/1609.344).toFixed(1)} mi`:"",t("d-instnote").textContent=r.atNow?"LIVE":c.hm(r.cursor),f(),k(),l.render();for(let P of y)P.render();n.render(),s.render(),w.render()}let i=null;function f(){let a=r.fmt,c=E=>`${a.weekday(E)} ${a.hour(E)}`,h=(E,M)=>a.isoDate(E)===a.isoDate(M)?`${a.weekday(E)} ${a.hour(E)}\u2013${a.hour(M)}`:`${c(E)} \u2013 ${c(M)}`,g=Bt.map(E=>{let M=_t(E),$=Ut(E,r,{hours:36,limit:1,minScore:50})[0],m=Xo(E,r,{hours:36,at:90});return{k:E,meta:M,w:$,g:m}}).sort((E,M)=>M.g.great-E.g.great||(M.w?.peak??0)-(E.w?.peak??0));t("d-act").innerHTML=g.map(({k:E,meta:M,w:$,g:m})=>{let T=m.great,L=m.eligible?T/m.eligible:0,C=T>0?R.good:($?.peak??0)>=60?R.warn:R.serious,O=$?`<b class="act-best">Best ${c($.peakAt)}</b><span class="act-good">Good ${h($.start,$.end)}</span>`+(T===0?`<span class="act-note">Best hour scores ${$.peak}/100</span>`:"")+($.limiter?`<span class="act-note">Held back by ${$.limiter}</span>`:""):'<span class="act-note">No good time in the next 36 hours</span>',_=i===E&&$,A=$?$.parts.map(I=>{let H=Math.round((1-I.value)*I.weight*100);return`<span class="act-factor"><span class="act-fname">${I.name}</span><span class="meter act-fbar" style="--ac:${H===0?R.good:I.value>=.6?R.warn:R.serious}"><i style="width:${Math.round(I.value*100)}%"></i></span><span class="act-fpts">${H?"\u2212"+H:"full marks"}</span></span>`}).join(""):"";return`
        <button type="button" class="act-row" data-act="${E}" aria-expanded="${_?"true":"false"}"
                aria-controls="act-why-${E}"${$?"":" disabled"}>
          <span class="act-icon" style="color:${M.color}">${M.icon}</span>
          <span class="act-text">
            <span class="act-name">${M.label}</span>
            <span class="act-when">${O}</span>
            <span class="meter act-bar" style="--ac:${C}"><i style="width:${Math.round(L*100)}%"></i></span>
          </span>
          <span class="act-score" style="color:${C}">${T}<small class="act-unit">great hours</small></span>
        </button>
        <div class="act-why" id="act-why-${E}"${_?"":" hidden"}>
          <span class="act-whyhd">Why the best hour (${$?c($.peakAt):""}) scores ${$?.peak??0}</span>${A}
        </div>`}).join("")}t("d-act").addEventListener("click",a=>{let c=a.target.closest(".act-row");!c||c.disabled||(i=i===c.dataset.act?null:c.dataset.act,f(),t("d-act").querySelector(`.act-row[data-act="${c.dataset.act}"]`)?.focus())}),t("d-act").addEventListener("keydown",a=>{if(a.key!=="Escape"||!i)return;let c=i;i=null,f(),t("d-act").querySelector(`.act-row[data-act="${c}"]`)?.focus()});function k(){let a=r.fmt,c=a.isoDate(Date.now()),h=r.days.filter(m=>m.tmax!=null&&a.isoDate(m.t)>=c);if(!h.length)return;let g=Math.min(...h.map(m=>m.tmin)),E=Math.max(...h.map(m=>m.tmax)),M=a.isoDate(Date.now()),$=a.isoDate(r.cursor);t("d-tenday").innerHTML=h.map(m=>{let T=a.isoDate(m.t),L=(E-m.tmax)/(E-g||1)*100,C=(m.tmin-g)/(E-g||1)*100,O=`linear-gradient(to top, ${Ee(m.tmin)}, ${Ee(m.tmax)})`;return`
        <div class="tenday-col ${T===M?"today":""} ${T===$?"cursor":""}" data-t="${m.t}">
          <div class="td-day">${T===M?"TODAY":a.weekday(m.t)}</div>
          <div class="td-date">${a.monthDay(m.t)}</div>
          <div class="td-glyph" title="${Qe(Math.round(m.code)).long}">${eo(Math.round(m.code),!0)}</div>
          <div class="td-hi">${Math.round(m.tmax)}\xB0</div>
          <div class="td-bar"><i style="top:${L}%;bottom:${C}%;background:${O};box-shadow:0 0 8px ${Ee(m.tmax)}66"></i></div>
          <div class="td-lo">${Math.round(m.tmin)}\xB0</div>
          <div class="td-pop">${(m.pop??0)>=10?`${Math.round(m.pop)}%`:""}</div>
        </div>`}).join(""),t("d-tdnote").textContent=`${h.length} DAYS AHEAD`,t("d-tenday").querySelectorAll(".tenday-col").forEach(m=>{m.addEventListener("click",()=>{r.playing=!1,r.scrubTo(+m.dataset.t+13*36e5)})})}let u=(a,c)=>`<div class="kv"><dt>${a}</dt><dd>${c}</dd></div>`,d=a=>["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous","Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"][Math.round((a%1+1)%1*8)%8],p=a=>{let c=r.fmt.isoDate(a),[,h,g]=c.split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][h-1]+g-1};return{update(){v(),o.update()},onHide(){o.onHide()}}}var ct="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas",jt="grayscale(1) brightness(1.18) contrast(1.05) sepia(.6) hue-rotate(170deg) saturate(1.3)",Kt="grayscale(1) brightness(1.9) contrast(1.1) sepia(.4) hue-rotate(170deg) saturate(.8)";var ke={lonToWorld:(e,t)=>(e+180)/360*Math.pow(2,t)*256,latToWorld:(e,t)=>{let o=Math.sin(Math.max(-85.05,Math.min(85.05,e))*Math.PI/180);return(.5-Math.log((1+o)/(1-o))/(4*Math.PI))*Math.pow(2,t)*256},worldToLon:(e,t)=>e/(Math.pow(2,t)*256)*360-180,worldToLat:(e,t)=>{let o=Math.PI-2*Math.PI*e/(Math.pow(2,t)*256);return 180/Math.PI*Math.atan(.5*(Math.exp(o)-Math.exp(-o)))}},wt=new Map,Vt=0;function aa(e,t){let o=wt.get(e);if(o)return o.state==="ok"?o.img:null;if(Vt>24)return null;let n=new Image,s={img:n,state:"loading"};if(wt.set(e,s),Vt++,n.crossOrigin="anonymous",n.onload=()=>{s.state="ok",Vt--,t?.()},n.onerror=()=>{s.state="err",Vt--},n.src=e,wt.size>600){let l=Math.floor(150);for(let w of wt.keys()){if(l--<=0)break;wt.delete(w)}}return null}var sa=10,dt=class{constructor(t,{center:o=[0,0],zoom:n=7,minZoom:s=2,maxZoom:l=12,onMove:w,onTap:y}={}){this.canvas=t,this.ctx=t.getContext("2d"),this.lat=o[0],this.lon=o[1],this.zoom=n,this.minZoom=s,this.maxZoom=l,this.onMove=w,this.onTap=y,this.layers=[],this.overlays=[],this.dirty=!0,this.w=0,this.h=0,this._raf=null,this._bind(),this._ro=new ResizeObserver(()=>this.resize()),this._ro.observe(t),this.resize()}resize(){let t=Math.min(window.devicePixelRatio||1,2),o=this.canvas.clientWidth,n=this.canvas.clientHeight;!o||!n||(this.canvas.width=Math.round(o*t),this.canvas.height=Math.round(n*t),this.ctx.setTransform(t,0,0,t,0,0),this.w=o,this.h=n,this.invalidate())}invalidate(){this._raf||(this._raf=requestAnimationFrame(()=>{this._raf=null,this.render()}))}setView(t,o,n){this.lat=t,this.lon=o,n!=null&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n))),this.invalidate(),this.onMove?.(this)}project(t,o){let n=this.zoom;return[ke.lonToWorld(o,n)-ke.lonToWorld(this.lon,n)+this.w/2,ke.latToWorld(t,n)-ke.latToWorld(this.lat,n)+this.h/2]}unproject(t,o){let n=this.zoom;return[ke.worldToLat(ke.latToWorld(this.lat,n)+o-this.h/2,n),ke.worldToLon(ke.lonToWorld(this.lon,n)+t-this.w/2,n)]}_placeAt(t,o,n,s){let l=this.zoom;this.lon=ke.worldToLon(ke.lonToWorld(o,l)+this.w/2-n,l),this.lat=Math.max(-85,Math.min(85,ke.worldToLat(ke.latToWorld(t,l)+this.h/2-s,l)))}_zoomAbout(t,o,n){let[s,l]=this.unproject(t,o);this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n)),this._placeAt(s,l,t,o)}_bind(){let t=this.canvas,o=new Map,n=null,s=null,l=v=>({x:v.clientX-s.left,y:v.clientY-s.top}),w=()=>{let v=[...o.values()];return{n:v.length,x:v.reduce((i,f)=>i+f.x,0)/v.length,y:v.reduce((i,f)=>i+f.y,0)/v.length,span:v.length<2?0:Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y)}},y=()=>{if(!o.size){n=null;return}let v=w(),[i,f]=this.unproject(v.x,v.y);n={lat:i,lon:f,span:v.span,zoom:this.zoom}};t.addEventListener("pointerdown",v=>{if(o.size>=2)return;s=t.getBoundingClientRect();let i=l(v);o.set(v.pointerId,{...i,x0:i.x,y0:i.y});try{t.setPointerCapture(v.pointerId)}catch{}y(),t.style.cursor="grabbing"}),t.addEventListener("pointermove",v=>{if(!n||!o.has(v.pointerId))return;let i=o.get(v.pointerId);o.set(v.pointerId,{...l(v),x0:i.x0,y0:i.y0});let f=w();f.n>1&&n.span>20&&f.span>8&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n.zoom+Math.log2(f.span/n.span)))),this._placeAt(n.lat,n.lon,f.x,f.y),this.invalidate(),this.onMove?.(this)});let S=v=>{let i=o.get(v.pointerId);if(o.delete(v.pointerId)){try{t.releasePointerCapture(v.pointerId)}catch{}this.onTap&&!o.size&&Math.hypot(i.x-i.x0,i.y-i.y0)<sa&&this.onTap({x:i.x,y:i.y},v),y(),o.size||(t.style.cursor="grab")}};t.addEventListener("pointerup",S),t.addEventListener("pointercancel",S),t.addEventListener("wheel",v=>{v.preventDefault();let i=t.getBoundingClientRect(),f=-v.deltaY*(v.deltaMode===1?.05:.0022);this._zoomAbout(v.clientX-i.left,v.clientY-i.top,this.zoom+f),this.invalidate(),this.onMove?.(this)},{passive:!1});for(let v of["gesturestart","gesturechange","gestureend"])t.addEventListener(v,i=>i.preventDefault());t.style.cursor="grab",t.style.touchAction="none"}render(){let{ctx:t,w:o,h:n}=this;if(!o||!n)return;t.clearRect(0,0,o,n),t.fillStyle="#0f1826",t.fillRect(0,0,o,n);let s=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),l=ke.lonToWorld(this.lon,this.zoom)-o/2,w=ke.latToWorld(this.lat,this.zoom)-n/2,y=()=>this.invalidate();for(let S of this.layers){if(S.enabled===!1||S.opacity===0)continue;let v=Math.min(s,S.maxTileZoom??s),i=256*Math.pow(2,this.zoom-v),f=Math.pow(2,v),k=Math.floor(l/i),u=Math.floor((l+o)/i),d=Math.floor(w/i),p=Math.floor((w+n)/i);t.save(),t.globalAlpha=S.opacity??1,S.filter&&(t.filter=S.filter),S.blend&&(t.globalCompositeOperation=S.blend);let a=.5;for(let c=d;c<=p;c++)if(!(c<0||c>=f))for(let h=k;h<=u;h++){let g=(h%f+f)%f,E=S.url(v,g,c);if(!E)continue;let M=aa(E,y);M&&t.drawImage(M,Math.round(h*i-l)-a,Math.round(c*i-w)-a,Math.ceil(i)+a*2,Math.ceil(i)+a*2)}t.restore()}for(let S of this.overlays){t.save();try{S(t,this)}catch(v){console.error("[map overlay]",v)}t.restore()}}destroy(){this._ro.disconnect()}};function ln(e,t,o,{stroke:n,fill:s,width:l=1.5,glow:w=8}){if(!o)return;let y=o.type==="Polygon"?[o.coordinates]:o.type==="MultiPolygon"?o.coordinates:null;if(y){e.beginPath();for(let S of y)for(let v of S)v.forEach(([i,f],k)=>{let[u,d]=t.project(f,i);k===0?e.moveTo(u,d):e.lineTo(u,d)}),e.closePath();s&&(e.fillStyle=s,e.fill("evenodd")),n&&(e.save(),w&&(e.shadowColor=n,e.shadowBlur=w/2),e.strokeStyle=n,e.lineWidth=l,e.stroke(),e.restore())}}function Yt(e,t,o,n="#f07aa6",s=null,l=0){e.save(),e.shadowColor=n,e.shadowBlur=7,e.strokeStyle=n,e.lineWidth=1.5;let w=7;e.beginPath(),e.arc(t,o,w,0,Math.PI*2),e.stroke(),e.beginPath();for(let[y,S]of[[-1,0],[1,0],[0,-1],[0,1]])e.moveTo(t+y*(w+2),o+S*(w+2)),e.lineTo(t+y*(w+7),o+S*(w+7));if(e.stroke(),e.fillStyle=n,e.beginPath(),e.arc(t,o,2.2,0,Math.PI*2),e.fill(),l>0&&(e.globalAlpha=1-l,e.beginPath(),e.arc(t,o,w+l*26,0,Math.PI*2),e.stroke(),e.globalAlpha=1),s){e.shadowBlur=0,e.font="600 11.5px 'Chakra Petch', sans-serif",e.letterSpacing="1.4px",e.textAlign="left",e.textBaseline="middle";let y=e.measureText(s).width+10;e.fillStyle="rgba(22,33,47,.85)",e.fillRect(t+w+8,o-7,y,14),e.fillStyle=n,e.fillText(s,t+w+13,o)}e.restore()}function xt(e,t,o,n){let s=156543.03392*Math.cos(t.lat*Math.PI/180)/Math.pow(2,t.zoom),w=s*110/1609.344,S=[1,2,5,10,20,50,100,200,500,1e3].reduce((i,f)=>Math.abs(f-w)<Math.abs(i-w)?f:i),v=S*1609.344/s;e.save(),e.strokeStyle="rgba(221,226,232,.75)",e.lineWidth=1,e.beginPath(),e.moveTo(o,n-4),e.lineTo(o,n),e.lineTo(o+v,n),e.lineTo(o+v,n-4),e.stroke(),e.font="500 11.5px 'JetBrains Mono', monospace",e.fillStyle="rgba(221,226,232,.75)",e.textAlign="center",e.textBaseline="bottom",e.fillText(`${S} mi`,o+v/2,n-5),e.restore()}function dn(e){e.className="view radar",e.innerHTML=`
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
  `;let t=m=>e.querySelector("#"+m),o=[],n=0,s=0,l="",w=null,y=performance.now(),S="",v=new dt(t("r-map"),{center:[r.loc?.lat??0,r.loc?.lon??0],zoom:7,minZoom:3,maxZoom:11,onMove:()=>a()});v.layers=[{name:"base",url:(m,T,L)=>`${ct}/World_Dark_Gray_Base/MapServer/tile/${m}/${L}/${T}`,filter:jt,opacity:1},{name:"radar",url:(m,T,L)=>{let C=o[n];return!C||!S?null:`${S}${C.path}/256/${m}/${T}/${L}/4/1_1.png`},opacity:.82,blend:"screen",maxTileZoom:7},{name:"labels",url:(m,T,L)=>`${ct}/World_Dark_Gray_Reference/MapServer/tile/${m}/${L}/${T}`,filter:Kt,opacity:1}];let i=m=>v.layers.find(T=>T.name===m);v.overlays.push((m,T)=>{if(i("alerts")?.enabled!==!1&&f)for(let L of r.alerts){if(!L.geometry)continue;let C=pt(L.event,L.severity);ln(m,T,L.geometry,{stroke:C,fill:V(C,.12),width:1.5,glow:10})}if(r.loc){let[L,C]=T.project(r.loc.lat,r.loc.lon);Yt(m,L,C,j[1],r.loc.name.toUpperCase())}xt(m,T,14,T.h-14),m.save(),m.strokeStyle="rgba(63,208,216,.06)",m.lineWidth=1;for(let L=1;L<4;L++)m.beginPath(),m.moveTo(T.w*L/4,0),m.lineTo(T.w*L/4,T.h),m.moveTo(0,T.h*L/4),m.lineTo(T.w,T.h*L/4),m.stroke();m.restore()});let f=!0,k=le(t("r-strip"),(m,T,L)=>{if(!o.length)return;let C=o.length,O=Math.max(2,T/C-2),_=o.findIndex(A=>A.kind==="nowcast");if(o.forEach((A,I)=>{let H=I*T/C,G=A.kind==="past",W=I===n?j[1]:G?j[0]:R.warn;m.fillStyle=V(W,I===n?1:.3),m.fillRect(H,I===n?2:6,O,I===n?L-4:L-12)}),_>0){let A=_*T/C-1;m.save(),m.strokeStyle=V(R.warn,.8),m.setLineDash([2,2]),m.beginPath(),m.moveTo(A,0),m.lineTo(A,L),m.stroke(),m.restore()}},{onPick:({x:m,w:T})=>{if(!o.length)return;let L=o[N(Math.floor(m/T*o.length),0,o.length-1)];r.playing=!1,r.emit("play",!1),r.scrubTo(L.time*1e3)}});function u(m){let T=0,L=1/0;for(let C=0;C<o.length;C++){let O=Math.abs(o[C].time*1e3-m);O<L&&(L=O,T=C)}return T}function d(){if(!o.length)return;let m=u(r.cursor);m!==n&&(n=m,c())}function p(){t("r-play").textContent=r.playing?"\u275A\u275A":"\u25B6"}let a=()=>k.render();function c(){let m=o[n];if(!m)return;t("r-time").textContent=r.fmt.hm(m.time*1e3);let T=Math.round((Date.now()/1e3-m.time)/60);t("r-age").textContent=m.kind==="nowcast"?`FORECAST +${Math.abs(T)}m`:T<=1?"LATEST":`${T} MIN AGO`,t("r-age").style.color=m.kind==="nowcast"?R.warn:T<=12?R.good:pe,v.invalidate(),k.render()}async function h(){try{let m=r.radar||await ce.radar();S=m.host;let T=(m.radar?.past||[]).map(C=>({...C,kind:"past"})),L=(m.radar?.nowcast||[]).map(C=>({...C,kind:"nowcast"}));o=[...T,...L],n=u(r.cursor),t("r-src").textContent=L.length?`${T.length} OBS + ${L.length} FCST`:`${T.length} OBSERVED`,c(),g()}catch(m){console.error("[radar] frames",m),t("r-src").textContent="UNAVAILABLE"}}function g(){let m=[["#62a4ef","light"],["#6cc98f","moderate"],["#ecd46a","heavy"],["#f59a5b","very heavy"],["#f47171","intense"],["#c89af5","hail"]];t("r-legend").innerHTML='<span class="lg-title">intensity</span>'+m.map(([T,L])=>`<b><i style="background:${T}"></i>${L}</b>`).join("")}function E(){let m=r.fmt,T=r.frame(),L=[T?.t,T?.precip,T?.cape,T?.cloud,r.alerts.length,r.hours.length].join("|");if(L===l&&r.raw===w)return;l=L,w=r.raw;let C=r.alerts;t("r-alertn").textContent=String(C.length),t("r-alertlist").innerHTML=C.length?C.map(Y=>`
      <div class="alert-item" style="--ac:${pt(Y.event,Y.severity)}">
        <b>${te(Y.event)}</b>
        <span>${te(Y.areaDesc||"").slice(0,90)}</span><br>
        <span>until ${m.weekday(Y.expires)} ${m.hm(Y.expires)}</span>
      </div>`).join(""):'<div class="nodata">no active alerts</div>';let O=r.frame(),_=r.hours.filter(Y=>Y.t>=Date.now()&&Y.t<=Date.now()+6*36e5),A=_.reduce((Y,B)=>Y+(B.precip??0),0),I=Math.max(0,..._.map(Y=>Y.pop??0));t("r-cover").innerHTML=`
      <dl style="margin:0">
        ${$("Now",O?.wx.label??"--")}
        ${$("Rate",O?.precip!=null?`${O.precip.toFixed(3)} in/hr`:"--")}
        ${$("Next 6h total",`${A.toFixed(2)} in`)}
        ${$("Peak chance 6h",`${Math.round(I)}%`)}
        ${$("Cloud cover",O?.cloud!=null?`${Math.round(O.cloud)}%`:"--")}
        ${$("Freezing level",O?.freezing!=null?`${Math.round(O.freezing*3.28084)} ft`:"--")}
      </dl>`;let H=O?.cape??0,G=O?.li,W=O?.cin,P=H<300?["STABLE",R.good]:H<1e3?["MARGINAL",j[0]]:H<2500?["MODERATE",R.warn]:H<4e3?["STRONG",R.serious]:["EXTREME",R.crit],U=Math.max(0,...r.hours.filter(Y=>Y.t>=Date.now()&&Y.t<=Date.now()+24*36e5).map(Y=>Y.cape??0));t("r-conv").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px">
        <span class="num" style="font-size:1.5rem;font-weight:700;color:${P[1]}">${Math.round(H)}</span>
        <span class="lbl">J/kg CAPE</span>
        <span class="chip" style="--ac:${P[1]};margin-left:auto">${P[0]}</span>
      </div>
      <div class="meter seg" style="--ac:${P[1]};margin-bottom:8px"><i style="width:${N(H/4e3*100,0,100)}%"></i></div>
      <dl style="margin:0">
        ${$("Lifted index",G!=null?G.toFixed(1):"--")}
        ${$("Inhibition",W!=null?`${Math.round(W)} J/kg`:"--")}
        ${$("Peak CAPE 24h",`${Math.round(U)} J/kg`)}
      </dl>
      <div style="font-size:max(.58rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        CAPE is the energy available to a rising parcel. Above ~1000 J/kg with a
        negative lifted index, thunderstorms become plausible.
      </div>`}t("r-play").addEventListener("click",()=>{r.playing=!r.playing,r.emit("play",r.playing),p()}),r.on("play",p),r.on("cursor",()=>{r.view==="radar"&&(d(),p())}),t("r-center").addEventListener("click",()=>{r.loc&&v.setView(r.loc.lat,r.loc.lon,7)}),t("r-zin").addEventListener("click",()=>v.setView(v.lat,v.lon,v.zoom+1)),t("r-zout").addEventListener("click",()=>v.setView(v.lat,v.lon,v.zoom-1)),t("r-labels").addEventListener("click",m=>{let T=i("labels");T.enabled=T.enabled===!1,m.currentTarget.classList.toggle("on",T.enabled!==!1),v.invalidate()}),t("r-alerts").addEventListener("click",m=>{f=!f,m.currentTarget.classList.toggle("on",f),v.invalidate()});function M(m){if(r.view!=="radar"){y=m;return}let T=Math.min(.2,(m-y)/1e3);if(y=m,r.playing&&o.length){s+=T;let L=n===o.length-1?1.1:.42;if(s>=L){s=0;let C=(n+1)%o.length;r.hours.length?r.setCursor(o[C].time*1e3):(n=C,c())}}}requestAnimationFrame(function m(T){requestAnimationFrame(m),M(T)}),r.on("loc",()=>{r.loc&&v.setView(r.loc.lat,r.loc.lon,7)}),r.on("radar",h);let $=(m,T)=>`<div class="kv"><dt>${m}</dt><dd>${T}</dd></div>`;return h(),{map:v,update(){E(),v.invalidate()},onShow(){v.resize(),k.render(),d(),r.playing=!0,r.emit("play",!0),p()},onHide(){r.playing=!1,r.emit("play",!1),r.following&&r.setCursor(Date.now())}}}function ia(e,t){if(!e?.length)return null;let o=null,n=1/0;for(let s of e){let l=Math.abs(s.t-t);l<n&&(n=l,o=s)}return n<=36e5?o:null}function cn(e,t){for(let o of t){let n=e[o];if(n instanceof Date&&!Number.isNaN(+n))return{at:+n,kind:o}}return null}function ra(e,t,o,n,s){let l=cn(t,["night","nauticalDusk","dusk"]),w=cn(o,["nightEnd","nauticalDawn","dawn"]);if(!l||!w||w.at<=l.at)return{dark:null,samples:[],goodHours:0,score:0,reason:"no darkness"};let y=[],S=Math.ceil(l.at/36e5)*36e5;for(let $=S;$<=w.at;$+=36e5){let m=ia(e,$);if(!m)continue;let T=s($),L=n($)>0;y.push({t:$,cloud:m.cloud??null,moonUp:L,moonLit:T,washed:L&&T>=.25,clear:m.cloud!=null&&m.cloud<=30})}if(!y.length)return{dark:{from:l.at,to:w.at,kind:l.kind},samples:[],goodHours:0,score:0,reason:"beyond the forecast"};let v=$=>$.clear&&!$.washed,i=y.filter(v).length,f=y.filter($=>$.clear).length,k=y.filter($=>$.cloud!=null),u=k.length?k.reduce(($,m)=>$+m.cloud,0)/k.length:null,d=null,p=null;for(let $ of y.concat([null])){if($&&v($)){p=p||{from:$.t,to:$.t},p.to=$.t+36e5;continue}p&&(!d||p.to-p.from>d.to-d.from)&&(d=p),p=null}let a=(w.at-l.at)/36e5,c=s(l.at+(w.at-l.at)/2),h=y.filter($=>$.moonUp).length/y.length,g=d?(d.to-d.from)/36e5:0,E=.65*Math.min(1,g/4)+.25*Math.min(1,i/Math.max(a,1))+.1*Math.min(1,a/6),M=Math.round(100*Math.max(0,Math.min(1,E)-.08*h*c));return{dark:{from:l.at,to:w.at,kind:l.kind,hours:a},samples:y,goodHours:i,clearHours:f,cloudMean:u,moonLit:c,moonUpHours:y.filter($=>$.moonUp).length,best:d,score:M}}function un(e,t,o,n,s,l=7,w=null){let{sunTimes:y,moonPosition:S,moonIllumination:v,toDeg:i}=s,f=[],k=w==null?(()=>{let p=new Date(n);return p.setHours(12,0,0,0),+p})():Math.floor((n+w)/(24*36e5))*24*36e5+12*36e5-w,u=p=>i(S(new Date(p),t,o).altitude),d=p=>v(new Date(p)).fraction;for(let p=0;p<l;p++){let a=new Date(k+p*24*36e5),c=new Date(k+(p+1)*24*36e5),h=ra(e,y(a,t,o),y(c,t,o),u,d);f.push({...h,index:p,day:+a})}return f}function uo(e){return e.slice(1).reduce((t,o)=>o.score>(t?.score??-1)?o:t,null)}function hn(e,t){let o=e[0],n=i=>t.hm(i);if(!o||!o.dark)return"No real darkness tonight at this latitude.";if(!o.samples.length)return"Tonight is beyond the forecast.";let s=uo(e),l=s&&s.score>o.score+15?s:null,w=i=>i.index===1?"Tomorrow":t.weekday(i.day),y=(i,f)=>`${i} ${f}${i===1?"":"s"}`,S=l?` ${w(l)} is the better night: ${y(l.goodHours,"clear moonless hour")}.`:"";if(o.best&&o.best.to-o.best.from>=2*36e5){let i=(o.best.to-o.best.from)/36e5,f=Math.round(i),k=o.moonLit>=.25&&o.moonUpHours?`, and the moon is ${Math.round(o.moonLit*100)}% lit`:"";if(o.dark.hours-i<1)return`Clear and moonless all night \u2014 about ${y(f,"hour")}, ${n(o.best.from)} to ${n(o.best.to)}${k}.`+S;if(f<3){let u=o.cloudMean!=null&&o.cloudMean>30?`, in a night averaging ${Math.round(o.cloudMean)}% cloud`:o.dark.hours<4?`, which is most of the ${y(Math.round(o.dark.hours),"hour")} of darkness`:"";return`A ${f}-hour window from ${n(o.best.from)}${u}${k}.`+S}return`Clear and moonless from ${n(o.best.from)} to ${n(o.best.to)} \u2014 about ${y(f,"hour")}${k}.`+S}return`Not tonight \u2014 ${o.cloudMean!=null&&o.cloudMean>30?`${Math.round(o.cloudMean)}% cloud through the dark hours`:o.moonUpHours&&o.moonLit>=.25?`a ${Math.round(o.moonLit*100)}% moon up for most of it`:"not much dark sky to work with"}.`+S}function fn(e){e.className="view skyview",e.innerHTML=`
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
  `;let t=a=>e.querySelector("#"+a),o=null;function n(){let{lat:a,lon:c}=r.loc||{lat:0,lon:0},h=r.fmt.isoDate(r.cursor),g=r.cursor;for(;r.fmt.isoDate(g-6e4)===h;)g-=6e4;let E=[],M=[];for(let $=0;$<=1440;$+=10){let m=new Date(g+$*6e4),T=xe(m,a,c),L=Ze(m,a,c);E.push({az:He(T.azimuth),alt:Fe(T.altitude),t:+m}),M.push({az:He(L.azimuth),alt:Fe(L.altitude),t:+m})}return{sun:E,moon:M,t0:g}}let s=le(t("s-dome"),(a,c,h,g)=>{let E=r.frame();if(!E)return;let{sun:M,moon:$}=n(),m=Math.min(c,h)/2-26,T=c/2,L=h/2;Go(a,T,L,m,{sunTrack:M,moonTrack:$,sun:{az:E.sun.compass,alt:E.sun.altDeg},moon:{az:E.moon.compass,alt:E.moon.altDeg},iss:o&&o.alt>0?o:null,night:E.sun.altDeg<-6?1:0}),a.save(),a.font="500 12px 'JetBrains Mono', monospace",a.textAlign="left",a.textBaseline="top";let C=[["SUN",`${E.sun.altDeg.toFixed(1)}\xB0  ${me(E.sun.compass)}`,"#f2b45a"],["MOON",`${E.moon.altDeg.toFixed(1)}\xB0  ${me(E.moon.compass)}`,"#7fb2f0"]];o&&C.push(["ISS",`${o.alt>0?`${o.alt.toFixed(0)}\xB0 ${me(o.az)}`:"below horizon"}`,"#8fdc6a"]),C.forEach(([O,_,A],I)=>{a.fillStyle=A,a.fillText(O,10,10+I*15),a.fillStyle=ve,a.fillText(_,52,10+I*15)}),a.restore()}),l=le(t("s-moon"),(a,c,h)=>{let g=r.frame();if(!g)return;let E=Math.min(c,h)/2-4;Nt(a,c/2,h/2,Math.max(10,E),g.moon.phase,g.moon.fraction)}),w=le(t("s-moonalt"),(a,c,h)=>{let{sun:g,moon:E}=n(),M={l:2,r:22,t:12,b:12},$={x:M.l,y:M.t,w:c-M.l-M.r,h:h-M.t-M.b};if($.w<30||$.h<20)return;let m=C=>$.y+$.h-(N(C,-60,90)+60)/150*$.h,T=C=>$.x+C/(E.length-1)*$.w;a.save(),a.strokeStyle="rgba(63,208,216,.30)",a.setLineDash([3,3]),a.beginPath(),a.moveTo($.x,m(0)),a.lineTo($.x+$.w,m(0)),a.stroke(),a.setLineDash([]),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=ae,a.textAlign="right",a.textBaseline="middle",a.fillText("0\xB0",$.x+$.w+18,m(0)),a.restore(),$e(a,g.map((C,O)=>[T(O),m(C.alt)]),"#f2b45a",{width:1.4,glow:6}),a.save(),a.setLineDash([3,3]),$e(a,E.map((C,O)=>[T(O),m(C.alt)]),"#7fb2f0",{width:1.6,glow:7}),a.restore();let L=N(Math.round((r.cursor-E[0].t)/(E.at(-1).t-E[0].t)*(E.length-1)),0,E.length-1);a.save(),a.strokeStyle=j[1],a.lineWidth=1,a.beginPath(),a.moveTo(T(L),$.y),a.lineTo(T(L),$.y+$.h),a.stroke(),a.restore(),a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=ae,a.textAlign="center",a.textBaseline="top";for(let C=0;C<=24;C+=6)C!==24&&Oe(a,String(C).padStart(2,"0"),T(C/24*(E.length-1)),h-M.b+1,0,c);a.restore(),be(a,$.x+2,1,"altitude \u2014 sun solid, moon dashed")}),y=le(t("s-daybar"),(a,c,h)=>{let g=r.sunTimesFor(),E=r.fmt.isoDate(r.cursor),M=r.cursor;for(;r.fmt.isoDate(M-6e4)===E;)M-=6e4;let $=M+24*36e5,m=A=>(A-M)/($-M)*c,T=8,L=16,C=(A,I,H)=>{if(A==null||I==null||isNaN(+A)||isNaN(+I))return;let G=N(m(+A),0,c),W=N(m(+I),0,c);W<=G||(a.fillStyle=H,a.fillRect(G,T,W-G,L))};a.fillStyle="#0f1826",a.fillRect(0,T,c,L),C(g.nightEnd,g.nauticalDawn,"rgba(30,20,70,.9)"),C(g.nauticalDawn,g.dawn,"rgba(40,40,120,.9)"),C(g.dawn,g.sunrise,"rgba(90,60,150,.9)"),C(g.sunrise,g.goldenHourEnd,"rgba(245,154,91,.85)"),C(g.goldenHourEnd,g.goldenHour,"rgba(90,180,235,.75)"),C(g.goldenHour,g.sunset,"rgba(245,154,91,.85)"),C(g.sunset,g.dusk,"rgba(150,70,140,.9)"),C(g.dusk,g.nauticalDusk,"rgba(60,45,130,.9)"),C(g.nauticalDusk,g.night,"rgba(30,20,70,.9)"),a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=ae,a.textAlign="center",a.textBaseline="top",a.strokeStyle="rgba(255,255,255,.10)";for(let A=0;A<=24;A+=3){let I=A/24*c;a.beginPath(),a.moveTo(I,T+L),a.lineTo(I,T+L+3),a.stroke(),A%6===0&&A<24&&Oe(a,String(A).padStart(2,"0"),I,T+L+5,0,c)}a.restore();let O=(A,I,H)=>{if(A==null||isNaN(+A))return;let G=N(m(+A),6,c-6);a.save(),a.strokeStyle=H,a.lineWidth=1,a.beginPath(),a.moveTo(G,T-4),a.lineTo(G,T+L),a.stroke(),a.font="600 11.5px 'Chakra Petch', sans-serif",a.fillStyle=H,a.textAlign="center",a.textBaseline="bottom",a.fillText(I,G,T-5),a.restore()};O(g.sunrise,"\u2191","#f2b45a"),O(g.sunset,"\u2193","#f2b45a");let _=N(m(r.cursor),0,c);a.save(),a.strokeStyle=j[1],a.lineWidth=1.5,a.shadowColor=j[1],a.shadowBlur=4,a.beginPath(),a.moveTo(_,T-6),a.lineTo(_,T+L+2),a.stroke(),a.restore()}),S=le(t("s-kp"),(a,c,h,g)=>{let E=r.kpForecast();if(!E.length){v(a,c,h,"no space weather data");return}Jo(a,c,h,g,{rows:E,tf:r.fmt,now:Date.now()})});function v(a,c,h,g){a.save(),a.font="600 11.5px 'Chakra Petch', sans-serif",a.fillStyle=ae,a.textAlign="center",a.textBaseline="middle",a.letterSpacing="1.6px",a.fillText(g.toUpperCase(),c/2,h/2),a.restore()}function i(a,c=Date.now()){let h=c,g=6*36e5,E=Je(new Date(h)).phase;for(let M=0;M<240;M++){h+=g;let $=Je(new Date(h)).phase;if(E<=a&&$>=a||E>$&&(E<=a||$>=a)){let T=h-g,L=h;for(let C=0;C<28;C++){let O=(T+L)/2,_=Je(new Date(O)).phase;_<a||_>.9&&a<.1?T=O:L=O}return(T+L)/2}E=$}return null}function f(){let a=r.frame();if(!a)return;let c=r.fmt;t("s-domewhen").textContent=r.atNow?"LIVE":`${c.weekday(r.cursor)} ${c.hm(r.cursor)}`;let h=r.moonTimesFor();t("s-mphase").textContent=bo(a.moon.phase).toUpperCase();let g=i(.5),E=i(0);t("s-moondl").innerHTML=`
      ${d("Illumination",`${(a.moon.fraction*100).toFixed(1)}%`)}
      ${d("Altitude",`${a.moon.altDeg.toFixed(1)}\xB0 ${me(a.moon.compass)}`)}
      ${d("Distance",`${Math.round(a.moon.distance).toLocaleString()} km`)}
      ${d("Moonrise",h.rise?c.hm(h.rise):h.alwaysUp?"always up":"\u2014")}
      ${d("Moonset",h.set?c.hm(h.set):h.alwaysDown?"never up":"\u2014")}
      ${d("Next full",g?`${c.monthDay(g)} ${c.hm(g)}`:"\u2014")}
      ${d("Next new",E?`${c.monthDay(E)} ${c.hm(E)}`:"\u2014")}
    `;let M=r.sunTimesFor(),$=a.day;t("s-daylen").textContent=$?.daylight?at($.daylight):"\u2014";let m="\u2014",T=r.days.findIndex(J=>c.isoDate(J.t)===c.isoDate(r.cursor));if(T>0&&r.days[T].daylight&&r.days[T-1].daylight){let J=r.days[T].daylight-r.days[T-1].daylight,se=Math.abs(J)/60;m=`${J>=0?"+":"\u2212"}${Math.floor(se)}m ${Math.round(se%1*60)}s vs yesterday`}t("s-sundl").innerHTML=`
      ${d("First light",c.hm(M.dawn))}
      ${d("Sunrise",c.hm(M.sunrise))}
      ${d("Golden hour ends",c.hm(M.goldenHourEnd))}
      ${d("Solar noon",`${c.hm(M.solarNoon)} \xB7 ${u().toFixed(1)}\xB0`)}
      ${d("Golden hour",c.hm(M.goldenHour))}
      ${d("Sunset",c.hm(M.sunset))}
      ${d("Civil dusk",c.hm(M.dusk))}
      ${d("Astronomical dark",isNaN(+M.night)?"none tonight":c.hm(M.night))}
      ${d("Day length",m)}
    `;let L=r.currentKp(),C=At(L);t("s-kpnow").textContent=L!=null?`Kp ${L.toFixed(2)} \xB7 ${C.name}`:"NO DATA";let O=r.space,_=O?.wind?.ok?O.wind.data?.[0]?.proton_speed:null,A=O?.mag?.ok?O.mag.data?.[0]?.bt:null,I=O?.mag?.ok?O.mag.data?.[0]?.bz_gsm:null,H=O?.scales?.ok?O.scales.data?.["0"]:null;t("s-spacedl").innerHTML=`
      ${d("Solar wind",_!=null?`${_} km/s`:"\u2014")}
      ${d("IMF Bt / Bz",A!=null?`${A} / ${I} nT`:"\u2014")}
      ${d("Aurora visible to",C.lat!=null?`${C.lat}\xB0 latitude`:"\u2014")}
      ${d("Your latitude",`${Math.abs(r.loc.lat).toFixed(1)}\xB0 ${r.loc.lat>=0?"N":"S"}`)}
      ${d("Radio / Solar / Geo",H?`R${H.R?.Scale??0} S${H.S?.Scale??0} G${H.G?.Scale??0}`:"\u2014")}
    `;let G=a.air,W=Wt("stargaze",{...a,air:G},{sunAltDeg:a.sun.altDeg,moonFraction:a.moon.fraction,moonUp:a.moon.altDeg>0}),P=W?.score??0,U=P>=75?R.good:P>=50?R.warn:P>=30?R.serious:R.crit;t("s-seenow").textContent=`${P}/100`;let Y=r.hours.filter(J=>J.t>Date.now()&&J.t<Date.now()+30*36e5),B=null;for(let J of Y){let se=r.frame(J.t);if(!se||se.sun.altDeg>-12)continue;let Q=Wt("stargaze",se,{sunAltDeg:se.sun.altDeg,moonFraction:se.moon.fraction,moonUp:se.moon.altDeg>0});(!B||Q.score>B.score)&&(B={t:J.t,score:Q.score,limiter:Q.limiter})}t("s-seeing").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:5px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${U}">${P}</span>
        <span class="lbl">stargazing now</span>
      </div>
      <div class="meter" style="--ac:${U};margin-bottom:9px"><i style="width:${P}%"></i></div>
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
        ${B?`Best hour right now: <b style="color:${ve}">${c.weekday(B.t)} ${c.hm(B.t)}</b> at ${B.score}/100${B.limiter?`, held back by ${B.limiter}`:""}.`:"No astronomical darkness in the next 30 hours."}
      </div>`,k(),s.render(),l.render(),w.render(),y.render(),S.render()}function k(){let a=t("s-tonight");if(!r.loc||!r.hours?.length){a.innerHTML="";return}let c=r.fmt,h=un(r.hours,r.loc.lat,r.loc.lon,Date.now(),{sunTimes:$t,moonPosition:Ze,moonIllumination:Je,toDeg:Fe}),g=uo(h),E=Math.max(4,...h.map($=>$.goodHours)),M=$=>{let m=g&&$.index===g.index&&$.score>h[0].score,T=$.score>=75?R.good:$.score>=45?R.warn:R.crit;return`
        <div class="tn-n${m?" pick":""}${$.index===0?" now":""}"
             title="${$.goodHours} clear moonless hours of ${$.dark?$.dark.hours.toFixed(1):0} dark">
          <span class="tn-h">${$.dark?`${$.goodHours}h`:"\u2014"}</span>
          <span class="tn-bar"><i style="height:${Math.round($.goodHours/E*100)}%;background:${T}"></i></span>
          <span class="tn-d">${c.weekday($.day).slice(0,3).toUpperCase()}</span>
        </div>`};a.innerHTML=`
      <p class="tn-verdict">${te(hn(h,c))}</p>
      <div class="tn-week">${h.map(M).join("")}</div>
      <p class="tn-key">clear, moonless hours per night \xB7 next ${7}</p>`}function u(){let{lat:a,lon:c}=r.loc||{lat:0,lon:0},h=r.sunTimesFor();return!h.solarNoon||isNaN(+h.solarNoon)?0:Fe(xe(h.solarNoon,a,c).altitude)}let d=(a,c)=>`<div class="kv"><dt>${a}</dt><dd>${c}</dd></div>`;async function p(){if(r.view==="sky")try{let a=await ce.iss();if(a.pos?.ok){let c=a.pos.data,h=r.loc||{lat:0,lon:0};o={...ft(h.lat,h.lon,c.latitude,c.longitude,c.altitude),lat:c.latitude,lon:c.longitude,visibility:c.visibility},s.render()}}catch{}}return setInterval(p,8e3),{update:f,onShow(){p(),s.render(),l.render(),w.render(),y.render(),S.render()}}}var mn=[{key:"pm25",label:"PM2.5",unit:"\xB5g/m\xB3",ref:35,who:15,note:"fine particulate \u2014 lungs and bloodstream"},{key:"pm10",label:"PM10",unit:"\xB5g/m\xB3",ref:150,who:45,note:"coarse dust and pollen fragments"},{key:"o3",label:"Ozone",unit:"\xB5g/m\xB3",ref:140,who:100,note:"photochemical smog, peaks mid-afternoon"},{key:"no2",label:"NO\u2082",unit:"\xB5g/m\xB3",ref:200,who:25,note:"traffic and combustion"},{key:"so2",label:"SO\u2082",unit:"\xB5g/m\xB3",ref:350,who:40,note:"industry and shipping"},{key:"co",label:"CO",unit:"\xB5g/m\xB3",ref:1e4,who:4e3,note:"incomplete combustion"}],da=["I very fair","II fair","III medium","IV olive","V brown","VI dark"];function pn(e){e.className="view airview",e.innerHTML=`
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
  `;let t=i=>e.querySelector("#"+i),o=le(t("a-gauge"),(i,f,k)=>{let d=r.frame()?.air?.aqi??r.airNow?.aqi,p=ze(d),a=Math.min(f,k)/2-22;je(i,f/2,k/2-4,Math.max(18,a),{value:d,min:0,max:300,color:p.color,label:"",unit:"US AQI",bands:[{from:0,to:50,color:R.good},{from:50,to:100,color:R.warn},{from:100,to:150,color:R.serious},{from:150,to:200,color:R.crit},{from:200,to:300,color:"#c89af5"}],ticks:6})}),n=le(t("a-uv"),(i,f,k,u)=>{let d=r.fmt.isoDate(r.cursor),p=r.hours.filter($=>r.fmt.isoDate($.t)===d);if(p.length<2)return;let a={l:2,r:24,t:12,b:14},c={x:a.l,y:a.t,w:f-a.l-a.r,h:k-a.t-a.b},h=$=>c.y+c.h-N($,0,12)/12*c.h;for(let[$,m,T]of[[3,R.good,"LOW"],[6,R.warn,"MOD"],[8,R.serious,"HIGH"],[11,R.crit,"V.HIGH"]])i.save(),i.strokeStyle=V(m,.3),i.setLineDash([3,3]),i.lineWidth=1,i.beginPath(),i.moveTo(c.x,h($)),i.lineTo(c.x+c.w,h($)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=V(m,.8),i.textAlign="right",i.textBaseline="bottom",Ae(i,T,c.x+c.w-2,h($)-1),i.restore();let g=p.length,E=Math.max(2,c.w/g-1.5);p.forEach(($,m)=>{let T=$.uv??0;if(T<=.03)return;let L=Ge(T).color;Ve(i,c.x+m*c.w/g,h(T),E,c.y+c.h,V(L,.85))});let M=p.map($=>[c.x+p.indexOf($)*c.w/g+E/2,h($.uvClear??0)]);i.save(),i.setLineDash([3,2]),i.strokeStyle=V(ve,.35),i.lineWidth=1,i.beginPath(),M.forEach(([$,m],T)=>T?i.lineTo($,m):i.moveTo($,m)),i.stroke(),i.restore(),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=ae,i.textAlign="center",i.textBaseline="top",p.forEach(($,m)=>{let T=r.fmt.hourOfDay($.t);Math.round(T)%4||Math.abs(T-Math.round(T))>.02||Oe(i,r.fmt.hm($.t),c.x+m*c.w/g+E/2,k-a.b+3,0,f)}),i.restore(),be(i,c.x+2,1,"uv index today \xB7 dashed = clear sky")}),s=le(t("a-fc"),(i,f,k,u)=>{let d=r.air.filter(T=>T.t>=Date.now()-216e5&&T.t<=Date.now()+3456e5);if(d.length<3){l(i,f,k,"no air quality forecast");return}let p={l:4,r:30,t:16,b:18},a={x:p.l,y:p.t,w:f-p.l-p.r,h:k-p.t-p.b},c=Math.max(110,Math.max(...d.map(T=>T.aqi??0))*1.15),h=T=>a.x+(T-d[0].t)/(d.at(-1).t-d[0].t)*a.w,g=T=>a.y+a.h-N(T,0,c)/c*a.h;for(let[T,L,C]of[[50,R.good,"GOOD"],[100,R.warn,"MODERATE"],[150,R.serious,"SENSITIVE"]])T>c||(i.save(),i.strokeStyle=V(L,.28),i.setLineDash([4,3]),i.beginPath(),i.moveTo(a.x,g(T)),i.lineTo(a.x+a.w,g(T)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=V(L,.85),i.textAlign="right",i.textBaseline="bottom",Ae(i,C,a.x+a.w-2,g(T)-2),i.restore());let E=d.length,M=Math.max(1,a.w/E-.5);d.forEach((T,L)=>{T.aqi!=null&&Ve(i,a.x+L*a.w/E,g(T.aqi),M,a.y+a.h,V(ze(T.aqi).color,.8),2)}),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=ae,i.textAlign="center",i.textBaseline="top",i.strokeStyle="rgba(255,255,255,.07)";let $="";d.forEach((T,L)=>{let C=r.fmt.isoDate(T.t);if(C===$)return;$=C;let O=a.x+L*a.w/E;i.beginPath(),i.moveTo(O,a.y),i.lineTo(O,a.y+a.h),i.stroke(),O<a.x+a.w-20&&i.fillText(r.fmt.weekday(T.t).toUpperCase(),O+16,k-p.b+4)}),i.restore();let m=h(Date.now());if(m>a.x&&m<a.x+a.w&&(i.save(),i.strokeStyle=V(R.good,.85),i.setLineDash([3,3]),i.beginPath(),i.moveTo(m,a.y),i.lineTo(m,a.y+a.h),i.stroke(),i.restore()),be(i,a.x+2,3,"us aqi \u2014 next 4 days"),u&&u.x>a.x&&u.x<a.x+a.w){let T=N(Math.round((u.x-a.x)/a.w*(E-1)),0,E-1),L=d[T],C=ze(L.aqi);i.save(),i.strokeStyle="rgba(255,255,255,.3)",i.beginPath(),i.moveTo(h(L.t),a.y),i.lineTo(h(L.t),a.y+a.h),i.stroke(),i.restore(),et(i,h(L.t),u.y,[`${r.fmt.weekday(L.t)} ${r.fmt.hm(L.t)}|`,`AQI|${Math.round(L.aqi??0)}`,`CATEGORY|${C.name}`,`PM2.5|${L.pm25?.toFixed(1)??"--"}`,`OZONE|${L.o3?.toFixed(0)??"--"}`],f,k,C.color,{pin:u.coarse})}});function l(i,f,k,u){i.save(),i.font="600 11.5px 'Chakra Petch', sans-serif",i.fillStyle=ae,i.textAlign="center",i.textBaseline="middle",i.letterSpacing="1.6px",i.fillText(u.toUpperCase(),f/2,k/2),i.restore()}function w(){let i=r.frame();if(!i)return;let f=i.air||r.airNow,k=f?.aqi,u=ze(k);t("a-cat").textContent=u.name,t("a-cat").style.color=u.color,t("a-note").textContent=S(k);let d=null;if(f)for(let E of mn){let M=f[E.key];if(M==null)continue;let $=M/E.ref;(!d||$>d.frac)&&(d={...E,value:M,frac:$})}t("a-dl").innerHTML=`
      ${v("Dominant",d?`${d.label} ${d.value.toFixed(1)} ${d.unit}`:"\u2014")}
      ${v("PM2.5",f?.pm25!=null?`${f.pm25.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
      ${v("Ozone",f?.o3!=null?`${f.o3.toFixed(0)} \xB5g/m\xB3`:"\u2014")}
      ${v("Aerosol depth",f?.aod!=null?f.aod.toFixed(3):"\u2014")}
      ${v("Dust",f?.dust!=null?`${f.dust.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
    `,t("a-poll").innerHTML=mn.map(E=>{let M=f?.[E.key];if(M==null)return"";let $=N(M/E.ref*100,0,100),m=M>E.who,T=$>100?R.crit:$>66?R.serious:$>33?R.warn:R.good;return`
        <div style="margin-bottom:7px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
            <span class="lbl" style="color:var(--dim)">${E.label}</span>
            <span class="num" style="font-size:max(.72rem,var(--fs-floor,0px));color:${T}">${M.toFixed(M<10?1:0)}<span style="color:var(--faint);font-size:max(.85em,var(--fs-floor,0px))"> ${E.unit}</span></span>
          </div>
          <div class="meter" style="--ac:${T};margin:3px 0 2px;position:relative">
            <i style="width:${$}%"></i>
            <span style="position:absolute;left:${N(E.who/E.ref*100,0,100)}%;top:-2px;bottom:-2px;width:1px;background:rgba(255,255,255,.5)"></span>
          </div>
          <div style="font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint)">${E.note}${m?' \xB7 <b style="color:'+R.serious+'">above WHO guideline</b>':""}</div>
        </div>`}).join("")||'<div class="nodata">no pollutant data</div>',y();let p=i.uv;t("a-uvnow").textContent=p!=null?`${p.toFixed(1)} \xB7 ${Ge(p).name}`:"\u2014";let a=i.day?.uvMax;t("a-burn").innerHTML=p>0||a>0?`
      <div class="lbl" style="margin-bottom:4px">time to burn at today's peak (UV ${(a??p).toFixed(1)})</div>
      <div class="burngrid">
        ${da.map((E,M)=>{let $=Et(a??p,M+1),m=$==null?pe:$<15?R.crit:$<30?R.serious:$<60?R.warn:R.good;return`<div><span class="lbl">${E}</span><b style="color:${m}">${$==null?"\u2014":$+"m"}</b></div>`}).join("")}
      </div>`:'<div class="nodata">no uv exposure right now</div>';let c=qe(i.dew);t("a-cmf").textContent=c.name;let h=i.feels,g=h!=null&&i.temp!=null?h-i.temp:null;t("a-comfort").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:6px">
        <span class="num" style="font-size:1.7rem;font-weight:700;color:${c.color}">${Z.temp(i.dew)}</span>
        <span class="lbl">dew point</span>
      </div>
      <div class="dewstrip">
        ${[[-99,30,"VERY DRY"],[30,45,"DRY"],[45,55,"COMFORTABLE"],[55,60,"STICKY"],[60,65,"HUMID"],[65,70,"OPPRESSIVE"],[70,99,"MISERABLE"]].map(([M,$,m])=>`<i class="${i.dew!=null&&i.dew>=M&&i.dew<$?"on":""}" style="--c:${qe((M+$)/2).color}" title="${m}"></i>`).join("")}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:max(.46rem,var(--fs-floor,0px));color:var(--faint);letter-spacing:.08em;margin-top:2px">
        <span>DRY</span><span>COMFORTABLE</span><span>OPPRESSIVE</span>
      </div>
      <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin:6px 0 8px">${c.note}</div>
      <dl style="margin:0">
        ${v("Air temperature",Z.temp(i.temp))}
        ${v("Feels like",`${Z.temp(i.feels)}${g!=null&&Math.abs(g)>=1?` (${Z.signed(g,0)}\xB0)`:""}`)}
        ${v("Relative humidity",Z.pct(i.rh))}
        ${v("Wet bulb",Z.temp(i.wetbulb))}
        ${v("Vapour deficit",i.vpd!=null?`${i.vpd.toFixed(2)} kPa`:"\u2014")}
      </dl>
      <div style="font-size:max(.56rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Dew point predicts how the air feels far better than relative humidity,
        which only tells you how close the air is to saturation at its own temperature.
      </div>`,o.render(),n.render(),s.render()}function y(){let i=r.pollen,f=r.fmt;if(!i||i.source==="none"){let d=r.frame()?.air,p=d&&["grass","birch","alder","ragweed","olive","mugwort"].map(a=>[a,d[a]]).filter(([,a])=>a!=null);if(p?.length){t("a-polsrc").textContent="CAMS EUROPE",t("a-pollen").innerHTML=p.map(([a,c])=>`
          <div class="kv"><dt>${a}</dt><dd>${c.toFixed(1)} grains/m\xB3</dd></div>`).join("");return}t("a-polsrc").textContent="NO COVERAGE",t("a-pollen").innerHTML=`<div class="nodata">
        pollen data unavailable here<br><span style="color:var(--faint);text-transform:none;letter-spacing:0">
        ${te(i?.reason||"no source covers this location")}</span></div>`;return}let k=mt(i.index),u=i.yesterday!=null&&i.index!=null?i.index-i.yesterday:null;t("a-polsrc").textContent=i.source.toUpperCase(),t("a-pollen").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${k.color}">${i.index?.toFixed(1)??"--"}</span>
        <div>
          <div class="chip" style="--ac:${k.color}">${k.name}</div>
          <div style="font-size:max(.54rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">of 12${u!=null?` \xB7 ${Z.signed(u,1)} vs yesterday`:""}</div>
        </div>
      </div>
      <div class="meter" style="--ac:${k.color};margin:7px 0 9px"><i style="width:${N(i.index/12*100,0,100)}%"></i></div>
      ${i.triggers?.length?`
        <div class="lbl" style="margin-bottom:4px">today's triggers</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px">
          ${i.triggers.map(d=>`<span class="chip" style="--ac:var(--lm)">${te(d.name)}</span>`).join("")}
        </div>`:""}
      ${i.forecast?.length?`
        <div class="lbl" style="margin-bottom:4px">5-day outlook</div>
        <div class="pollen-fc">
          ${i.forecast.map(d=>{let p=mt(d.index);return`<div>
              <span class="bar" style="height:${N(d.index/12*100,4,100)}%;--c:${p.color}"></span>
              <b>${d.index.toFixed(1)}</b>
              <span>${f.weekday(Date.parse(d.date))}</span>
            </div>`}).join("")}
        </div>`:""}`}function S(i){return i==null?"no measurement available":i<=50?"Air quality is satisfactory. No restrictions.":i<=100?"Acceptable. Unusually sensitive people may want to limit long outdoor exertion.":i<=150?"Sensitive groups \u2014 asthma, heart or lung conditions, children, older adults \u2014 should reduce prolonged exertion.":i<=200?"Everyone may begin to feel effects. Limit prolonged outdoor exertion.":i<=300?"Health alert. Avoid outdoor exertion; keep windows closed.":"Emergency conditions. Remain indoors with filtration if possible."}let v=(i,f)=>`<div class="kv"><dt>${i}</dt><dd>${f}</dd></div>`;return{update:w,onShow(){o.render(),n.render(),s.render()}}}function gn(e){e.className="view dataview",e.innerHTML=`
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
  `;let t=u=>e.querySelector("#"+u),o=u=>ko(u,r.tz);function n(){let u=r.fmt.isoDate(Date.now()),d=r.days.find(p=>r.fmt.isoDate(p.t)===u);return d?d.t:Date.now()-12*36e5}function s(u,d,p,a){u.save(),u.font="600 11.5px 'Chakra Petch', sans-serif",u.fillStyle=ae,u.textAlign="center",u.textBaseline="middle",u.letterSpacing="1.6px",u.fillText(a.toUpperCase()+" \u2026",d/2,p/2),u.restore()}let l=le(t("d2-clim"),(u,d,p,a)=>{if(!r.climate){s(u,d,p,"loading 30-year archive");return}Zo(u,d,p,a,{days:r.days.filter(c=>c.t>=n()),climate:r.climate,tf:r.fmt,doyOf:o})}),w=le(t("d2-spread"),(u,d,p,a)=>{if(!r.models){s(u,d,p,"loading model ensemble");return}xo(u,d,p,a,{rows:r.models.rows,tf:r.fmt,now:Date.now()})}),y=le(t("d2-meteo"),(u,d,p,a)=>{Ht(u,d,p,a,{hours:r.hours,days:r.days,tf:r.fmt,span:{lo:r.cursor-24*36e5,hi:r.cursor+96*36e5},cursor:r.cursor,now:Date.now(),panels:["pressure","cloud","uv","cape"]})},{onPick:({x:u,w:d})=>{let p=r.cursor-864e5,a=r.cursor+96*36e5;r.playing=!1,r.scrubTo(p+(u-4)/(d-34)*(a-p))}}),S=le(t("d2-trend"),(u,d,p,a)=>{let c=r.climate?.annual;if(!c?.length){s(u,d,p,"loading climate record");return}let h={l:4,r:34,t:16,b:18},g={x:h.l,y:h.t,w:d-h.l-h.r,h:p-h.t-h.b};if(g.w<40||g.h<30)return;let E=c.map(x=>x.mean),M=Math.min(...E)-.4,$=Math.max(...E)+.4,m=x=>g.x+x/(c.length-1)*g.w,T=x=>g.y+g.h-(x-M)/($-M)*g.h;Ce(u,g,We(M,$,_e(g.h,3)).map(x=>({v:x,y:T(x)})),x=>`${x.toFixed(1)}\xB0`);let L=E.reduce((x,ue)=>x+ue,0)/E.length,C=Math.max(2,g.w/c.length-2);c.forEach((x,ue)=>{let Re=x.mean-L,de=Re>=0?Be("#8d9aab","#f2b45a",N(Math.abs(Re)/1.6,0,1)):Be("#8d9aab","#7fb2f0",N(Math.abs(Re)/1.6,0,1)),b=T(L),D=T(x.mean);u.fillStyle=V(de,.9),u.fillRect(m(ue)-C/2,Math.min(b,D),C,Math.max(1.5,Math.abs(D-b)))});let O=c.length,_=c.reduce((x,ue)=>x+ue.year,0)/O,A=L,I=0,H=0;for(let x of c)I+=(x.year-_)*(x.mean-A),H+=(x.year-_)**2;let G=H?I/H:0,W=c.map((x,ue)=>[m(ue),T(A+G*(x.year-_))]);u.save(),u.setLineDash([5,3]),$e(u,W,G>=0?"#f2b45a":"#7fb2f0",{width:2,glow:10}),u.restore(),u.save(),u.font="500 11.5px 'JetBrains Mono', monospace",u.fillStyle=ae,u.textAlign="center",u.textBaseline="top";let P=5*Rt(Math.ceil(c.length/5),g.w,u.measureText("2020").width);c.forEach((x,ue)=>{x.year%P||Oe(u,String(x.year),m(ue),p-h.b+4,0,d)}),u.restore(),u.save(),u.font="600 11.5px 'Chakra Petch', sans-serif",u.letterSpacing="1.2px";let U=`TREND ${G>=0?"+":"\u2212"}${Math.abs(G*10).toFixed(2)}\xB0F / DECADE`,Y=u.measureText(U).width;u.fillStyle=G>=0?"#f2b45a":"#7fb2f0",u.textAlign="right",u.textBaseline="top",u.fillText(U,g.x+g.w,3),u.restore(),u.save(),u.font=ye,u.letterSpacing="1.4px";let B="annual mean temperature \xB0F",J="annual mean \xB0F",se=x=>u.measureText(x.toUpperCase()).width,Q=se(B)+Y+14<=g.w?B:se(J)+Y+14<=g.w?J:null;if(u.restore(),Q&&be(u,g.x+2,3,Q),a&&a.x>g.x&&a.x<g.x+g.w){let x=N(Math.round((a.x-g.x)/g.w*(c.length-1)),0,c.length-1),ue=c[x];u.save(),u.fillStyle="rgba(22,33,47,.94)",u.strokeStyle=V(j[0],.5);let Re=`${ue.year}  ${ue.mean.toFixed(2)}\xB0F  ${ue.mean-L>=0?"+":"\u2212"}${Math.abs(ue.mean-L).toFixed(2)} vs period mean`;u.font="500 11.5px 'JetBrains Mono', monospace";let de=u.measureText(Re).width+14,b=N(m(x)-de/2,4,Math.max(4,d-de-4)),D=a.coarse&&a.y<p/2?g.y+g.h-20:g.y+2;u.beginPath(),u.rect(b,D,de,18),u.fill(),u.stroke(),u.fillStyle=ve,u.textAlign="left",u.textBaseline="middle",u.fillText(Re,b+7,D+9),u.restore()}});function v(){let u=r.fmt,d=r.climate,p=r.dayFor(r.cursor),a=d?.doy?.[o(r.cursor)];if(t("d2-yrs").textContent=d?`${d.years} YEARS \xB7 ${d.start.slice(0,4)}\u2013${d.end.slice(0,4)}`:"\u2014",a&&p){let O=p.tmax-a.normalHigh,_=p.tmin-(a.normalLow??p.tmin),A=N((p.tmax-a.normalHigh)/Math.max(.1,a.recordHigh-a.normalHigh)*100,0,100);t("d2-rec").innerHTML=`
        <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin-bottom:7px">
          ${u.weekday(r.cursor)} ${u.monthDay(r.cursor)} \xB7 forecast against every
          ${u.monthDay(r.cursor)} since ${d.start.slice(0,4)}
        </div>
        <dl style="margin:0">
          ${k("Forecast high",Z.temp(p.tmax),O>=0?"#f2b45a":"#7fb2f0")}
          ${f("Normal high",`${Z.temp(a.normalHigh)}  (${Z.signed(O)}\xB0)`)}
          ${k("Record high",`${Z.temp(a.recordHigh)} in ${a.recordHighYear}`,p.tmax>=a.recordHigh?R.crit:pe)}
          ${f("Forecast low",Z.temp(p.tmin))}
          ${f("Normal low",`${Z.temp(a.normalLow)}  (${Z.signed(_)}\xB0)`)}
          ${k("Record low",`${Z.temp(a.recordLow)} in ${a.recordLowYear}`,p.tmin<=a.recordLow?j[4]:pe)}
        </dl>
        <div class="lbl" style="margin:9px 0 3px">high, normal \u2192 record</div>
        <div class="meter" style="--ac:${A>85?R.crit:R.serious}">
          <i style="width:${A}%"></i></div>
        <div style="display:flex;justify-content:space-between;font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">
          <span>${Z.temp(a.normalHigh)} normal</span><span>${Z.temp(a.recordHigh)} record</span>
        </div>
        <dl style="margin:9px 0 0">
          ${f("Historically wet",`${Math.round(a.wetFrac*100)}% of years`)}
          ${f("Mean precip",`${a.meanPrecip.toFixed(3)} in`)}
          ${f("Forecast precip",`${(p.precip??0).toFixed(2)} in`)}
        </dl>`}else t("d2-rec").innerHTML='<div class="nodata">climate archive loading\u2026</div>';let c=Date.now(),h=r.hours.filter(O=>O.t<=c&&O.t>=c-720*36e5),g=0,E=0,M=0;for(let O of r.days){if(O.tmax==null||O.tmin==null)continue;let _=(O.tmax+O.tmin)/2;O.t>c||(g+=Math.max(0,65-_),E+=Math.max(0,_-65),M+=Math.max(0,Math.min(_,86)-50))}let $=r.models?.rows?.find(O=>O.t>=c),m=$?$.spread<2?["HIGH",R.good]:$.spread<5?["MODERATE",R.warn]:$.spread<9?["LOW",R.serious]:["VERY LOW",R.crit]:null,T=r.models?.rows?.find(O=>O.t>=c+168*36e5),L=r.days.filter(O=>O.t>c).reduce((O,_)=>O+(_.precip??0),0),C=r.days.filter(O=>O.t>c&&(O.precip??0)>=.01).length;t("d2-derived").innerHTML=`
      <dl style="margin:0">
        ${f("Pressure now",`${Z.pressure(r.frame()?.pressure)} inHg`)}
        ${f("3h tendency",i())}
        ${m?k("Forecast confidence",`${m[0]} \xB7 \xB1${($.spread/2).toFixed(1)}\xB0`,m[1]):""}
        ${T?f("Day-7 model spread",`${T.spread.toFixed(1)}\xB0`):""}
        ${f("16-day precip total",`${L.toFixed(2)} in`)}
        ${f("Wet days ahead",`${C} of ${r.days.filter(O=>O.t>c).length}`)}
      </dl>
      <div class="lbl" style="margin:9px 0 3px">degree days, window shown</div>
      <dl style="margin:0">
        ${f("Heating (base 65\xB0F)",Math.round(g))}
        ${f("Cooling (base 65\xB0F)",Math.round(E))}
        ${f("Growing (50/86\xB0F)",Math.round(M))}
      </dl>
      <div style="font-size:max(.55rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Degree days accumulate how far each day's mean sits from a base
        temperature \u2014 the standard proxy for heating load, cooling load and
        crop development.
      </div>`,l.render(),w.render(),S.render(),y.render()}function i(){let u=r.cursor,d=r.hours.find(h=>h.t>=u-3*36e5),p=r.hours.find(h=>h.t>=u);if(!d?.pressure||!p?.pressure)return"\u2014";let a=(p.pressure-d.pressure)*.029529983,c=Math.abs(a)<.02?"steady":Math.abs(a)<.06?"slow":Math.abs(a)<.12?"moderate":"rapid";return`${Z.signed(a,3)} inHg \xB7 ${a>0?"rising":a<0?"falling":""} ${c}`.trim()}let f=(u,d)=>`<div class="kv"><dt>${u}</dt><dd>${d}</dd></div>`,k=(u,d,p)=>`<div class="kv"><dt>${u}</dt><dd style="color:${p}">${d}</dd></div>`;return{update:v,onShow(){l.render(),w.render(),S.render(),y.render()}}}var ot=null,ca=()=>ot?Promise.resolve(ot):import("./sats.OZS22OPN.js").then(e=>ot=e),vn=1852,ua=1e4,yn=24,wn="atmos.sats.v1",ha=5e3,bn=2,Mn=(e,t)=>t?ae:Be("#f07aa6","#3fd0d8",N((e??0)/38e3,0,1));function Sn(e){e.className="view overheadview",e.innerHTML=`
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
  `;let t=b=>e.querySelector("#"+b),o=[],n=0,s=null,l=null,w=null,y=null,S=null,v=!1,i=Object.fromEntries(Ie.map(b=>[b.key,b.on]));try{let b=JSON.parse(localStorage.getItem(wn)||"null");if(b&&typeof b=="object")for(let D of Ie)typeof b[D.key]=="boolean"&&(i[D.key]=b[D.key])}catch{}let f={},k=[],u=null,d=0,p=null,a=[],c=()=>r.loc||{lat:0,lon:0},h=new dt(t("o-map"),{center:[c().lat,c().lon],zoom:9,minZoom:5,maxZoom:12,onTap:b=>g(b)});h.layers=[{name:"base",url:(b,D,q)=>`${ct}/World_Dark_Gray_Base/MapServer/tile/${b}/${q}/${D}`,filter:jt,opacity:1},{name:"labels",url:(b,D,q)=>`${ct}/World_Dark_Gray_Reference/MapServer/tile/${b}/${q}/${D}`,filter:Kt,opacity:.85}],h.overlays.push((b,D)=>{let q=c(),[F,z]=D.project(q.lat,q.lon),K=156543.03392*Math.cos(D.lat*Math.PI/180)/Math.pow(2,D.zoom);b.save(),b.strokeStyle="rgba(63,208,216,.13)",b.setLineDash([2,4]),b.lineWidth=1,b.font="500 11.5px 'JetBrains Mono', monospace",b.fillStyle=j[0],b.textAlign="center",b.textBaseline="bottom";for(let X of[10,20,40]){let ee=X*vn/K;ee<24||ee>Math.max(D.w,D.h)||(b.beginPath(),b.arc(F,z,ee,0,Math.PI*2),b.stroke(),Ae(b,`${X} NM`,F,z-ee-2))}b.restore();for(let X of v?[]:o){let[ee,oe]=D.project(X.lat,X.lon);if(ee<-20||oe<-20||ee>D.w+20||oe>D.h+20)continue;let fe=X.hex===l,Me=Mn(X.alt,X.gnd);if(fe){let Le=(X.gs??0)/60;if(Le>.1&&X.trk!=null){let yo=Le*vn/K,wo=(X.trk-90)*Math.PI/180;b.save(),b.strokeStyle=V(Me,.6),b.setLineDash([3,3]),b.lineWidth=1.2,b.beginPath(),b.moveTo(ee,oe),b.lineTo(ee+Math.cos(wo)*yo,oe+Math.sin(wo)*yo),b.stroke(),b.restore()}b.save(),b.strokeStyle=Me,b.lineWidth=1.5,b.shadowColor=Me,b.shadowBlur=5,b.beginPath(),b.arc(ee,oe,13,0,Math.PI*2),b.stroke(),b.restore()}if(b.save(),b.translate(ee,oe),b.rotate((X.trk??0)*Math.PI/180),b.fillStyle=Me,fe&&(b.shadowColor=Me,b.shadowBlur=4),b.beginPath(),b.moveTo(0,-6.5),b.lineTo(4.5,5),b.lineTo(0,2.4),b.lineTo(-4.5,5),b.closePath(),b.fill(),b.restore(),fe&&X.cs){b.save(),b.font="600 11.5px 'Chakra Petch', sans-serif",b.letterSpacing="1.2px",b.textAlign="left",b.textBaseline="middle";let Le=b.measureText(X.cs).width+10;b.fillStyle="rgba(22,33,47,.88)",b.fillRect(ee+16,oe-7,Le,14),b.fillStyle=Me,b.fillText(X.cs,ee+21,oe),b.restore()}}v&&Y(b,D),r.loc&&Yt(b,F,z,"#f07aa6",null),xt(b,D,12,D.h-12)});function g(b){if(v){let F=null,z=yn;for(let K of k){let[X,ee]=h.project(K.p.lat,K.p.lon),oe=Math.hypot(X-b.x,ee-b.y);oe<z&&(z=oe,F=K)}B(F?F.sat.id:null);return}let D=null,q=yn;for(let F of o){let[z,K]=h.project(F.lat,F.lon),X=Math.hypot(z-b.x,K-b.y);X<q&&(q=X,D=F)}E(D?D.hex:null)}function E(b){if(l===b||(l=b,w=null,T(),h.invalidate(),!b))return;let D=o.find(q=>q.hex===b);D&&ce.flight(D.cs||"",D.hex||"").then(q=>{l===b&&(w=q,T())}).catch(()=>{})}let M=(b,D)=>`<div class="kv"><dt>${b}</dt><dd>${D}</dd></div>`,$=b=>b==null?"\u2014":`${Math.round(b).toLocaleString()} ft`;function m(b,D){let q=c(),F=Math.PI/180,z=(D-q.lon)*F,K=Math.sin(z)*Math.cos(b*F),X=Math.cos(q.lat*F)*Math.sin(b*F)-Math.sin(q.lat*F)*Math.cos(b*F)*Math.cos(z);return(Fe(Math.atan2(K,X))+360)%360}function T(){if(v){se();return}let b=o.find(ee=>ee.hex===l);if(!b){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap an aircraft on the map, or a row in NEAREST.</p>';return}t("o-cs").textContent=b.cs||b.reg||b.hex.toUpperCase();let D=b.vs==null||Math.abs(b.vs)<100?"level":b.vs>0?`climbing ${Math.round(b.vs).toLocaleString()} ft/min`:`descending ${Math.abs(Math.round(b.vs)).toLocaleString()} ft/min`,q=m(b.lat,b.lon),F=[],z=w;z?.airline?F.push(M("Operator",te(z.airline))):z?.aircraft?.owner&&F.push(M("Operator",te(z.aircraft.owner)));let K=z?.aircraft?.manufacturer&&z?.aircraft?.type?`${z.aircraft.manufacturer} ${z.aircraft.type}`:b.type;if(K&&F.push(M("Aircraft",te(K))),b.reg&&F.push(M("Registration",te(b.reg))),z?.origin||z?.destination){let ee=oe=>oe?`${te(oe.iata||"??")} <span class="dim">${te(oe.city||"")}</span>`:"\u2014";F.push(M("From",ee(z.origin))),F.push(M("To",ee(z.destination)))}F.push(M("Altitude",b.gnd?"on the ground":$(b.alt))),F.push(M("Motion",`${b.gs==null?"\u2014":`${Math.round(b.gs)} kt`} \xB7 ${D}`)),F.push(M("Heading",b.trk==null?"\u2014":`${Math.round(b.trk)}\xB0 ${me(b.trk)}`)),F.push(M("From you",`${(b.dst??0).toFixed(1)} nm ${me(q)}`));let X=z&&!z.origin&&b.cs?'<p class="hint">No published route \u2014 usually private or general aviation.</p>':z?.origin?'<p class="hint">Route is by callsign, which airlines reuse day to day.</p>':"";t("o-sel").innerHTML=F.join("")+X}function L(){if(v){Q();return}t("o-neartitle").textContent="NEAREST";let b=o.filter(D=>!D.gnd).slice(0,8);if(t("o-src").textContent=s?s.toUpperCase():"NO FEED",!b.length){t("o-near").innerHTML='<p class="hint">Nothing in the air within range.</p>';return}t("o-near").innerHTML='<div class="oh-head"><span>callsign</span><span>type</span><span>range</span><span>alt</span></div>'+b.map(D=>`
      <button class="oh-row" data-hex="${te(D.hex)}" aria-pressed="${D.hex===l}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${Mn(D.alt,D.gnd)} 80%, var(--ink))">${te(D.cs||D.reg||D.hex)}</span>
        <span class="oh-t">${te(D.type||"")}</span>
        <span class="oh-d">${(D.dst??0).toFixed(1)} nm</span>
        <span class="oh-a">${D.alt==null?"\u2014":`${(D.alt/1e3).toFixed(1)}k`}</span>
      </button>`).join("");for(let D of t("o-near").querySelectorAll(".oh-row"))D.addEventListener("click",()=>{E(D.dataset.hex),L()})}function C(){let b=c(),D=new Date(r.cursor),q=xe(D,b.lat,b.lon),F=Ze(D,b.lat,b.lon),z=(ee,oe,fe,Me)=>{let Le=oe>0;return`<div class="kv"><dt style="color:${Me}">${ee}</dt><dd>${Le?`${oe.toFixed(0)}\xB0 up, ${me(fe)}`:'<span class="dim">below the horizon</span>'}</dd></div>`},K=[z("Sun",Fe(q.altitude),He(q.azimuth),"#f2b45a"),z("Moon",Fe(F.altitude),He(F.azimuth),"#7fb2f0")];K.push(y&&y.alt>0?z("ISS",y.alt,y.az,"#8fdc6a"):`<div class="kv"><dt style="color:#8fdc6a">ISS</dt><dd><span class="dim">${y?`below the horizon, ${y.range.toLocaleString()} km away`:"no fix"}</span></dd></div>`);let X=Math.abs(r.cursor-Date.now());t("o-lookwhen").textContent=X<6*6e4?"NOW":`${r.fmt.weekday(r.cursor)} ${r.fmt.hm(r.cursor)}`,t("o-sky").innerHTML=K.join("")+'<p class="hint">Aircraft positions from adsb.lol under ODbL; routes and airframes from adsbdb. Both are run by volunteers.</p>'}function O(){if(v){x();return}let b=o.filter(q=>!q.gnd).length;t("o-count").textContent=`${b} AIRCRAFT`;let D=n?Math.round((Date.now()-n)/1e3):null;t("o-age").textContent=D==null?"\u2014":D<20?"LIVE":`${D}s AGO`}async function _(){if(!(v||r.view!=="overhead"||!r.loc))try{let b=await ce.aircraft(r.loc.lat,r.loc.lon,60);o=b.aircraft||[],n=b.at||Date.now(),s=b.source,l&&!o.some(D=>D.hex===l)&&E(null),O(),L(),T(),h.invalidate()}catch{}}async function A(){if(!(r.view!=="overhead"||!r.loc))try{let b=await ce.iss();if(b.pos?.ok){let D=b.pos.data;y=ft(r.loc.lat,r.loc.lon,D.latitude,D.longitude,D.altitude),C()}}catch{}}let I=b=>Ie.find(D=>D.key===b),H=b=>`${b.lat.toFixed(1)},${b.lon.toFixed(1)}`,G=b=>b<1?`${Math.max(1,Math.round(b*60))} min`:b<48?`${Math.round(b)} h`:`${Math.round(b/24)} days`;async function W(b){let D=f[b.key];if(!(D&&(D.state==="ok"||D.state==="loading"))){f[b.key]={state:"loading",sats:[],fetched:null};try{await ca();let q=new Map,F=1/0;for(let z of b.groups){let K=await fetch(new URL(`/sats/${z}.json`,location.origin));if(!K.ok)throw new Error(`${z} -> ${K.status}`);let X=await K.json(),ee=Date.parse(X.fetched);Number.isFinite(ee)&&(F=Math.min(F,ee));for(let oe of ot.prepare(X.records,b.key))q.set(oe.id,oe)}if(!q.size)throw new Error("empty");f[b.key]={state:"ok",sats:[...q.values()],fetched:Number.isFinite(F)?F:null}}catch{f[b.key]={state:"fail",sats:[],fetched:null}}U(!0),ue(),L(),T(),O(),h.invalidate()}}let P={};function U(b){if(!v)return;let D=r.cursor,q=c(),F=[];for(let K of Ie){let X=f[K.key];if(!i[K.key]||!X||X.state!=="ok")continue;let ee=P[K.key],oe=K.key==="starlink";if(!b&&oe&&ee&&Math.abs(D-ee.at)<ha){F.push(...ee.list);continue}let fe=[];for(let Me of X.sats){let Le=ot.positionAt(Me,D);Le&&fe.push({sat:Me,p:Le,cat:K,look:ft(q.lat,q.lon,Le.lat,Le.lon,Le.altKm)})}P[K.key]={at:D,list:fe},F.push(...fe)}k=F;let z=k.find(K=>K.sat.id===u);a=z?ot.groundTrack(z.sat,D,90,60):[]}function Y(b,D){let q=256*Math.pow(2,D.zoom),F=k.find(z=>z.sat.id===u);for(let z of[-q,0,q]){if(F&&a.length){b.save(),b.strokeStyle=V(F.cat.colour,.7),b.setLineDash([4,4]),b.lineWidth=1.4;for(let K of a)b.beginPath(),K.forEach(([X,ee],oe)=>{let[fe,Me]=D.project(X,ee);oe?b.lineTo(fe+z,Me):b.moveTo(fe+z,Me)}),b.stroke();b.restore()}for(let K of k){let[X,ee]=D.project(K.p.lat,K.p.lon),oe=X+z;if(oe<-6||ee<-6||oe>D.w+6||ee>D.h+6)continue;let fe=K.cat.key==="starlink";b.fillStyle=K.cat.colour,b.beginPath(),b.arc(oe,ee,fe?1.7:3.2,0,Math.PI*2),b.fill()}if(F){let[K,X]=D.project(F.p.lat,F.p.lon),ee=K+z;if(ee<-40||X<-20||ee>D.w+40||X>D.h+20)continue;b.save(),b.strokeStyle=F.cat.colour,b.lineWidth=1.5,b.shadowColor=F.cat.colour,b.shadowBlur=5,b.beginPath(),b.arc(ee,X,10,0,Math.PI*2),b.stroke(),b.restore(),b.save(),b.font="600 11.5px 'Chakra Petch', sans-serif",b.letterSpacing="1.2px",b.textAlign="left",b.textBaseline="middle";let oe=b.measureText(F.sat.name).width+10;b.fillStyle="rgba(22,33,47,.88)",b.fillRect(ee+14,X-7,oe,14),b.fillStyle=F.cat.colour,b.fillText(F.sat.name,ee+19,X),b.restore()}}}function B(b){u!==b&&(u=b,U(!1),T(),L(),h.invalidate())}let J=b=>k.filter(D=>H(D.p)===H(b.p)&&D.sat.id!==b.sat.id);function se(){let b=k.find(fe=>fe.sat.id===u);if(!b){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap a dot on the map, or a row in ABOVE YOU.</p>';return}let{sat:D,p:q,look:F,cat:z}=b;t("o-cs").textContent=D.name;let K=[M("Kind",te(kt(D.name))),M("Group",te(z.label)),M("NORAD ID",String(D.id))];D.intl&&K.push(M("Launch",te(D.intl))),K.push(M("Altitude",`${Math.round(q.altKm).toLocaleString()} km`)),K.push(M("Over",`${Math.abs(q.lat).toFixed(1)}\xB0${q.lat<0?"S":"N"} ${Math.abs(q.lon).toFixed(1)}\xB0${q.lon<0?"W":"E"}`)),K.push(M("From you",F.alt>0?`${F.alt.toFixed(0)}\xB0 up, ${me(F.az)}`:`<span class="dim">below the horizon, ${F.range.toLocaleString()} km away</span>`));let X=ot.elementAgeHours(D,r.cursor);K.push(M("Elements",`${X<0?"newer than":""} ${G(Math.abs(X))} ${X<0?"ahead":"old"}`.trim()));let ee=J(b),oe=ee.length?`<p class="hint">Same orbit data, so same position: ${ee.slice(0,6).map(fe=>te(fe.sat.name)).join(", ")}${ee.length>6?` and ${ee.length-6} more`:""}. Docked craft share the station's elements.</p>`:"";t("o-sel").innerHTML=K.join("")+oe+'<p class="hint">Dashed line: next 90 minutes of ground track. Kind is read from the catalogue name.</p>'}function Q(){t("o-neartitle").textContent="ABOVE YOU",t("o-src").textContent="CELESTRAK";let b=new Set,D=k.filter(z=>z.look.alt>0).sort((z,K)=>K.look.alt-z.look.alt),q=[];for(let z of D){let K=H(z.p);if(!b.has(K)&&(b.add(K),q.push({q:z,extra:J(z).length}),q.length>=8))break}let F=Ie.some(z=>i[z.key]&&f[z.key]?.state==="ok");if(!q.length){t("o-near").innerHTML=`<p class="hint">${F?"Nothing in the chosen groups is above your horizon right now.":"Switch on a group above to see what is overhead."}</p>`;return}t("o-near").innerHTML='<div class="oh-head"><span>name</span><span>type</span><span>up</span><span>dir</span></div>'+q.map(({q:z,extra:K})=>`
      <button class="oh-row" data-sat="${z.sat.id}" aria-pressed="${z.sat.id===u}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${z.cat.colour} 80%, var(--ink))">${te(z.sat.name)}${K?` +${K}`:""}</span>
        <span class="oh-t">${kt(z.sat.name)==="satellite"?"":te(kt(z.sat.name))}</span>
        <span class="oh-d">${z.look.alt.toFixed(0)}\xB0</span>
        <span class="oh-a">${me(z.look.az)}</span>
      </button>`).join("");for(let z of t("o-near").querySelectorAll(".oh-row"))z.addEventListener("click",()=>B(Number(z.dataset.sat)))}function x(){let b=Ie.filter(q=>i[q.key]&&f[q.key]?.state==="ok");t("o-count").textContent=`${k.length.toLocaleString()} SATELLITES`;let D=b.map(q=>f[q.key].fetched).filter(Boolean);t("o-age").textContent=D.length?`ELEMENTS ${G((Date.now()-Math.min(...D))/36e5).toUpperCase()} OLD`:"\u2014"}function ue(){let b=Ie.some(F=>i[F.key]&&f[F.key]?.state==="loading"),D=Ie.some(F=>i[F.key]&&f[F.key]?.state==="fail");t("o-satstate").textContent=v?b?"LOADING":D?"NO DATA":`${k.length.toLocaleString()} SHOWN`:"OFF";let q=F=>{let z=f[F.key],K=!v||!i[F.key]?"":z?.state==="loading"?" \u2026":z?.state==="fail"?" \u2715":z?.state==="ok"?` ${z.sats.length.toLocaleString()}`:"";return`<button class="oh-chip" data-cat="${F.key}" aria-pressed="${!!i[F.key]}" style="--chip:${F.colour}">${te(F.label)}${K}</button>`};t("o-satui").innerHTML=`
      <button class="oh-chip oh-mode" data-mode="1" aria-pressed="${v}">${v?"Back to aircraft":"Show satellites on map"}</button>
      <div class="oh-chips">${Ie.map(q).join("")}</div>
      ${D?'<p class="hint">Satellite elements are not available here. They are published to branyontech.com every two hours.</p>':""}
      ${v&&i.starlink?'<p class="hint">Starlink is thousands of objects: a large download, loaded only when on.</p>':""}
      ${v?'<p class="hint">Elements: CelesTrak. Positions computed here (SGP4).</p>':""}`}function Re(){try{localStorage.setItem(wn,JSON.stringify(i))}catch{}}function de(b){if(v!==b){if(v=b,clearInterval(p),p=null,b){E(null),h.minZoom=1;let D=c();h.setView(N(D.lat*.5,-40,40),D.lon,bn);for(let q of Ie)i[q.key]&&W(q);r.view==="overhead"&&(p=setInterval(()=>{U(!1),x(),L(),h.invalidate()},1e3)),U(!0)}else u=null,a=[],k=[],h.minZoom=5,h.setView(c().lat,c().lon,9),_();ue(),T(),L(),O(),h.invalidate()}}return t("o-satui").addEventListener("click",b=>{let D=b.target.closest("button");if(!D)return;if(D.dataset.mode){de(!v);return}let q=I(D.dataset.cat);q&&(i[q.key]=!i[q.key],Re(),v&&i[q.key]&&W(q),U(!0),u!=null&&!k.some(F=>F.sat.id===u)&&(u=null),ue(),T(),L(),O(),h.invalidate())}),t("o-center").addEventListener("click",()=>{r.loc&&(v?h.setView(N(r.loc.lat*.5,-40,40),r.loc.lon,bn):h.setView(r.loc.lat,r.loc.lon,9))}),t("o-zin").addEventListener("click",()=>h.setView(h.lat,h.lon,h.zoom+1)),t("o-zout").addEventListener("click",()=>h.setView(h.lat,h.lon,h.zoom-1)),r.on("loc",()=>{if(r.loc){if(v){U(!0),L(),h.invalidate(),A();return}h.setView(r.loc.lat,r.loc.lon,9),_(),A()}}),T(),C(),ue(),r.on("cursor",()=>{r.view==="overhead"&&(C(),v&&(U(!1),T(),L(),h.invalidate()))}),{map:h,update(){C(),h.invalidate()},onShow(){h.resize(),_(),A(),clearInterval(S),S=setInterval(()=>{_(),O()},ua),v&&!p&&(p=setInterval(()=>{U(!1),x(),L(),h.invalidate()},1e3))},onHide(){clearInterval(S),S=null,clearInterval(p),p=null}}}var re=null,Ue=null,Zt=!1,De=null,fa=0,bt=1/0;function $n(e,t=4){let o=e.createBuffer(1,e.sampleRate*t,e.sampleRate),n=o.getChannelData(0);for(let s=0;s<n.length;s++)n[s]=Math.random()*2-1;return o}function ho(e,t,{type:o,freq:n,q:s,gain:l}){let w=e.createBufferSource();w.buffer=$n(e),w.loop=!0;let y=e.createBiquadFilter();y.type=o,y.frequency.value=n,y.Q.value=s;let S=e.createGain();return S.gain.value=l,w.connect(y).connect(S).connect(t),w.start(),{src:w,filt:y,gain:S}}function kn(){if(re)return;let e=window.AudioContext||window.webkitAudioContext;if(!e)return;re=new e,Ue=re.createGain(),Ue.gain.value=0;let t=re.createDynamicsCompressor();t.threshold.value=-18,t.ratio.value=6,t.attack.value=.004,t.release.value=.25,Ue.connect(t).connect(re.destination);let o=ho(re,Ue,{type:"bandpass",freq:1400,q:.7,gain:0}),n=ho(re,Ue,{type:"highpass",freq:4200,q:.5,gain:0}),s=ho(re,Ue,{type:"bandpass",freq:420,q:1.6,gain:0}),l=re.createOscillator(),w=re.createGain();l.frequency.value=.07,w.gain.value=180,l.connect(w).connect(s.filt.frequency),l.start();let y=re.createGain();y.gain.value=0;let S=re.createBiquadFilter();S.type="lowpass",S.frequency.value=480,S.Q.value=.6,S.connect(y).connect(Ue);let v=[0,3.5].map(i=>{let f=re.createOscillator();f.type="sawtooth",f.frequency.value=55,f.detune.value=i;let k=re.createGain();return k.gain.value=.22,f.connect(k).connect(S),f.start(),f});De={rain:o,patter:n,wind:s,drone:{oscs:v,gain:y,filt:S},lfo:l,lfoGain:w}}function nt(){return Zt}function Tn(e){Zt=e,re&&(e&&re.state==="suspended"&&re.resume(),Ke(Ue.gain,e?.5:0,e?1.2:.6))}var Ke=(e,t,o=.6)=>{let n=re.currentTime;e.cancelScheduledValues(n),e.setValueAtTime(e.value,n),e.linearRampToValueAtTime(t,n+o)};function ma(e=.5){if(!re||!Zt)return;let t=re.currentTime,o=re.createBufferSource();o.buffer=$n(re,3);let n=re.createBiquadFilter();n.type="lowpass",n.frequency.setValueAtTime(700-e*480,t),n.Q.value=.5;let s=re.createGain(),l=.55*(1-e*.65);s.gain.setValueAtTime(1e-4,t),s.gain.exponentialRampToValueAtTime(Math.max(.02,l),t+.04+e*.3),s.gain.exponentialRampToValueAtTime(1e-4,t+1.6+e*2.4),o.connect(n).connect(s).connect(Ue),o.start(t),o.stop(t+4.2)}function En(e){if(!re||!Zt||!De)return;let t=e.frame();if(!t)return;let o=t.wx.kind,n=Math.min(1,Math.max((t.precip??0)/.1,o==="rain"||o==="storm"?t.wx.intensity*.5:0)),s=Math.min(1,(t.wind??0)/32),l=Math.min(1,((t.gust??t.wind??0)-(t.wind??0))/18);Ke(De.rain.gain.gain,n*.3,.9),Ke(De.rain.filt.frequency,900+n*1500,.9),Ke(De.patter.gain.gain,n*n*.1,.9),Ke(De.wind.gain.gain,s*.24,1.1),Ke(De.wind.filt.Q,1.2+l*2.5,1.1),De.lfo.frequency.value=.05+l*.22,De.lfoGain.gain.value=120+l*420;let w=t.temp??60,y=44+Math.max(0,Math.min(1,(w-20)/80))*26;for(let i of De.drone.oscs)i.frequency.setTargetAtTime(y,re.currentTime,1.5);Ke(De.drone.gain.gain,.055+(t.sun.altDeg>0?.02:.05),2),Ke(De.drone.filt.frequency,300+Math.max(0,t.sun.altDeg)*9,2);let S=o==="storm"?.9:Math.min(.6,(t.cape??0)/2500),v=performance.now();S>.15?(bt===1/0&&(bt=v+Math.random()*6e3),v>bt&&(ma(Math.random()*(1-S*.6)),bt=v+3e3+Math.random()*22e3*(1.1-S))):bt=1/0,fa=S}function pa(e){let t=e.fmt,o=e.frame(Date.now());if(!o)return[];let n=[],s=o.day,l=Date.now();n.push({tone:"lead",text:`${t.full(l)}. It is ${Z.temp(o.temp)} and ${o.wx.long.toLowerCase()} in ${e.loc.name}`+(Math.abs((o.feels??o.temp)-o.temp)>=3?`, feeling like ${Z.temp(o.feels)}`:"")+"."});for(let p of e.alerts.slice(0,3))n.push({tone:"alert",text:`${p.event} in effect until ${t.weekday(p.expires)} ${t.hm12(p.expires)}.`+(p.instruction?` ${ga(p.instruction)}`:"")});if(s){let p=e.climate?.doy?.[va(e,l)],a=`Today runs ${Z.temp(s.tmin)} to ${Z.temp(s.tmax)}`;if(p){let c=s.tmax-p.normalHigh;Math.abs(c)>=3?a+=`, ${Math.abs(c).toFixed(0)}\xB0 ${c>0?"above":"below"} the normal high of ${Z.temp(p.normalHigh)}`:a+=", right about normal",s.tmax>=p.recordHigh&&(a+=`. That would tie or beat the record of ${Z.temp(p.recordHigh)} set in ${p.recordHighYear}`)}n.push({tone:"body",text:a+"."})}let w=vt(e);if(w?.raining)n.push({tone:"wet",text:w.minutes!=null?`It is raining now and should ease within ${w.minutes} minutes.`:"It is raining now, with no break in the next six hours."});else if(w?.minutes!=null&&w.minutes<=240)n.push({tone:"wet",text:`Rain arrives in about ${w.minutes} minutes, around ${t.hm12(w.changeAt)}.`});else{let p=e.hours.find(a=>a.t>l&&(a.pop??0)>=40);p?n.push({tone:"body",text:`Dry for now. The next real chance of rain is ${t.weekday(p.t)} around ${t.hm12(p.t)}, at ${Math.round(p.pop)} percent.`}):n.push({tone:"body",text:"No meaningful rain anywhere in the sixteen-day window."})}let y=Math.max(...e.hours.filter(p=>p.t>l&&p.t<l+24*36e5).map(p=>p.gust??0),0);y>=22&&n.push({tone:"warn",text:`Wind is worth planning around: gusts reach ${Math.round(y)} miles per hour today, ${Lt(y).effect}.`});let S=qe(o.dew);["STICKY","HUMID","OPPRESSIVE","MISERABLE","LETHAL"].includes(S.name)?n.push({tone:"warn",text:`The air is ${S.name.toLowerCase()} \u2014 dew point ${Z.temp(o.dew)}, ${S.note}.`}):S.name==="VERY DRY"&&n.push({tone:"body",text:`Very dry air, dew point ${Z.temp(o.dew)}. Expect static and chapped lips.`});let v=s?.uvMax;if(v!=null&&v>=6){let p=Math.round(350/(v*15));n.push({tone:"warn",text:`UV peaks at ${v.toFixed(1)}, ${Ge(v).name.toLowerCase()}. Unprotected skin burns in roughly ${p} minutes.`})}let i=o.air?.aqi??e.airNow?.aqi;i!=null&&i>75&&n.push({tone:"warn",text:`Air quality is ${ze(i).name.toLowerCase()} at ${Math.round(i)} on the US index.`});let f=e.pollen;if(f?.index!=null&&f.index>=7){let p=(f.triggers||[]).map(a=>a.name).slice(0,3).join(", ");n.push({tone:"warn",text:`Pollen is ${mt(f.index).name.toLowerCase().replace("-"," to ")} at ${f.index.toFixed(1)} of 12${p?`, driven by ${p}`:""}.`})}let k=Bt.map(p=>({k:p,w:Ut(p,e,{hours:24,limit:1,minScore:62})[0]})).filter(p=>p.w).sort((p,a)=>a.w.peak-p.w.peak).slice(0,2);for(let p of k){let a=_t(p.k);n.push({tone:"good",text:`Best window to ${a.label.toLowerCase()}: ${t.weekday(p.w.start)} ${t.hm12(p.w.start)} to ${t.hm12(p.w.end)}, scoring ${p.w.peak} out of 100.`})}let u=e.currentKp();if(u!=null&&u>=5){let p=At(u);n.push({tone:"space",text:`Geomagnetic activity is elevated: Kp ${u.toFixed(1)}, ${p.name}. Aurora may be visible to about ${p.lat} degrees latitude.`})}let d=e.sunTimesFor(l);return n.push({tone:"body",text:`Sunset is at ${t.hm12(d.sunset)}, with golden hour beginning ${t.hm12(d.goldenHour)}`+(s?.daylight?` and ${at(s.daylight)} of daylight today`:"")+"."}),n}var ga=e=>{let t=String(e).replace(/\s+/g," ").match(/^.{0,180}?[.!?](\s|$)/);return(t?t[0]:String(e).slice(0,180)).trim()};function va(e,t){let[,o,n]=e.fmt.isoDate(t).split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][o-1]+n-1}var ya={lead:"var(--cy)",alert:"var(--rd)",warn:"var(--am)",wet:"var(--ice)",good:"var(--lm)",space:"var(--vi)",body:"var(--ink)"};function fo(e,t){let o=pa(e);t(`
    <div class="hd">BRIEFING<span class="rule"></span>
      <span class="val">${te(e.loc.name.toUpperCase())} \xB7 ${e.fmt.hm(Date.now())}</span></div>
    <div class="res-list" style="max-height:60vh">
      ${o.map((n,s)=>`
        <p style="
          margin:0 0 10px;
          font-size:${s===0?".92rem":".8rem"};
          line-height:1.6;
          color:${ya[n.tone]||"var(--ink)"};
          ${n.tone==="alert"?"border-left:2px solid var(--rd);padding-left:10px;":""}
          ${s===0?"font-weight:600;":""}
        ">${te(n.text)}</p>`).join("")}
    </div>
    <div style="display:flex;gap:6px;margin-top:12px">
      <button class="tl-btn" id="speakBtn">\u25B6 SPEAK</button>
      <button class="tl-btn" id="stopBtn">\u25A0 STOP</button>
    </div>
  `,n=>{let s=()=>{if(!window.speechSynthesis)return;speechSynthesis.cancel();let l=o.map(S=>S.text).join(" "),w=new SpeechSynthesisUtterance(l);w.rate=1.02,w.pitch=.85;let y=speechSynthesis.getVoices().find(S=>/en[-_](GB|US)/.test(S.lang)&&S.localService);y&&(w.voice=y),speechSynthesis.speak(w)};n.querySelector("#speakBtn").addEventListener("click",s),n.querySelector("#stopBtn").addEventListener("click",()=>speechSynthesis?.cancel()),e.settings.voice&&setTimeout(s,220)})}function An(e,t,o){let n=t.ownerDocument,s='a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]',l=null,w=!1,y=()=>[...t.querySelectorAll(s)].filter(u=>u.tabIndex>=0&&!u.matches(":disabled")&&!u.closest("[hidden], [inert]")&&u.getClientRects().length&&n.defaultView.getComputedStyle(u).visibility!=="hidden").sort((u,d)=>(u.tabIndex||1/0)-(d.tabIndex||1/0)),S=()=>(y()[0]||t).focus();function v(u){!e.hidden&&!t.contains(u.target)&&S()}function i(u){if(e.hidden||u.defaultPrevented||u.isComposing)return;if(u.key==="Escape"){u.preventDefault(),u.stopPropagation(),k();return}if(u.key!=="Tab"||u.ctrlKey||u.metaKey||u.altKey)return;let d=y(),p=d[0],a=d.at(-1);p?(!d.includes(n.activeElement)||(u.shiftKey?n.activeElement===p:n.activeElement===a))&&(u.preventDefault(),(u.shiftKey?a:p).focus()):(u.preventDefault(),t.focus({preventScroll:!0}))}function f(u,d,p){e.hidden&&(l=p||n.activeElement,w=o?.inert||!1,o&&(o.inert=!0),n.addEventListener("keydown",i,!0),n.addEventListener("focusin",v)),t.innerHTML=u;let a=t.querySelector(".hd");a?(a.id||="modalTitle",t.setAttribute("aria-labelledby",a.id),t.removeAttribute("aria-label")):(t.removeAttribute("aria-labelledby"),t.setAttribute("aria-label","Weather dialog")),e.hidden=!1,e.scrollTop=t.scrollTop=0,d&&d(t),t.contains(n.activeElement)||S()}function k(){if(e.hidden)return;e.hidden=!0,n.removeEventListener("keydown",i,!0),n.removeEventListener("focusin",v),t.innerHTML="",o&&(o.inert=w);let u=l;l=null,u?.isConnected&&!u.closest("[inert]")&&u.focus({preventScroll:!0})}return e.addEventListener("click",u=>{u.target===e&&k()}),{open:f,close:k}}var go=["deck","radar","sky","air","data","overhead"],wa=5*6e4,he={sky:document.getElementById("sky"),boot:document.getElementById("boot"),bootLog:document.getElementById("bootLog"),led:document.getElementById("led"),locBtn:document.getElementById("locBtn"),locName:document.getElementById("locName"),locSub:document.getElementById("locSub"),nav:document.getElementById("nav"),clockTime:document.getElementById("clockTime"),clockZone:document.getElementById("clockZone"),alertBtn:document.getElementById("alertBtn"),soundBtn:document.getElementById("soundBtn"),briefBtn:document.getElementById("briefBtn"),cfgBtn:document.getElementById("cfgBtn"),scrub:document.getElementById("scrub"),modal:document.getElementById("modal"),modalCard:document.getElementById("modalCard")},Ye=new Pt(he.sky),In=null,Ne={},Pn=An(he.modal,he.modalCard,document.getElementById("app")),Ln=[];function Te(e,t=""){Ln.push(t?`<span class="${t}">${e}</span>`:e),he.bootLog.innerHTML=Ln.join(`
`)}async function ba(){Te("ATMOS//NET v1.0.0"),Te('<span class="mut">initialising atmospheric console\u2026</span>'),Ro();let e=new URLSearchParams(location.search).get("q");e!==null&&/^[0-3]$/.test(e)&&ro(+e),Te(`render tier ${ne.tier} \xB7 ${ne.onBattery?"battery":"AC power"}`,"ok");let t=Ye.init();Ye.setQuality(ne.tier),Te(t?"webgl2 sky renderer online":"webgl2 unavailable \u2014 sky disabled",t?"ok":"err"),ne.onChange(l=>Ye.setQuality(l));let o=r.loc,n=null;o?Te(`location: ${te(o.name)}`):(n=await ce.config(),o=n.home,Te(`no saved location \u2014 using ${te(o.name)}`)),Te('<span class="mut">contacting feeds\u2026</span>'),await r.setLocation(o,{remember:!n?.public});let s=r.raw;Te(`open-meteo forecast  ${s?.forecast?.ok?"OK":"FAIL"}`,s?.forecast?.ok?"ok":"err"),Te(`open-meteo air       ${s?.air?.ok?"OK":"FAIL"}`,s?.air?.ok?"ok":"err"),Te(`nws alerts           ${s?.alerts?.ok?"OK":"FAIL"}`,s?.alerts?.ok?"ok":"err"),Te(`noaa swpc space wx   ${s?.space?.ok?"OK":"FAIL"}`,s?.space?.ok?"ok":"err"),Te(`${r.hours.length} hourly steps \xB7 ${r.days.length} days \xB7 ${r.min15.length} 15-min steps`,"ok"),Ma(),Te("console ready","ok"),setTimeout(()=>{he.boot.classList.add("done");let l=r.skyParams();l&&Ye.snap(l)},0),On(),setInterval(()=>{document.hidden||r.refresh()},wa),ka(n)}function Ma(){In=Ko(he.scrub),Ne.deck=rn(document.getElementById("view-deck")),Ne.radar=dn(document.getElementById("view-radar")),Ne.sky=fn(document.getElementById("view-sky")),Ne.air=pn(document.getElementById("view-air")),Ne.data=gn(document.getElementById("view-data")),Ne.overhead=Sn(document.getElementById("view-overhead"));let e=()=>{let o=Ne[r.view];o?.update&&o.update()};r.on("data",()=>{e(),mo()}),r.on("cursor",()=>{e(),St()}),r.on("climate",e),r.on("models",e),r.on("pollen",e),r.on("observed",e),r.on("radar",e),r.on("loc",mo),r.on("status",o=>{he.led.dataset.state=o==="ok"?"":o}),he.nav.addEventListener("click",o=>{let n=o.target.closest("button[data-view]");n&&Mt(n.dataset.view)}),he.locBtn.addEventListener("click",Rn),he.alertBtn.addEventListener("click",Nn),he.briefBtn.addEventListener("click",()=>fo(r,ht)),he.cfgBtn.addEventListener("click",Hn),he.soundBtn.addEventListener("click",vo),document.addEventListener("visibilitychange",()=>{document.hidden||(Jt=0,r.syncToNow())}),window.addEventListener("resize",()=>{Ye.resize()}),document.addEventListener("keydown",Ta),window.addEventListener("hashchange",()=>Mt(location.hash.slice(1),{push:!1}));let t=location.hash.slice(1);go.includes(t)&&t!=="deck"?Mt(t):document.documentElement.style.setProperty("--stage-dim","0.25"),mo(),e()}function mo(){let e=r.loc;e&&(he.locName.textContent=e.name,he.locSub.textContent=[e.admin1,e.country].filter(Boolean).join(" \xB7 ")||`${e.lat.toFixed(2)}, ${e.lon.toFixed(2)}`),he.clockZone.textContent=r.tz.split("/").pop().replace(/_/g," "),he.alertBtn.dataset.n=String(r.alerts.length),he.soundBtn.classList.toggle("on",nt())}function Mt(e,{push:t=!0}={}){if(!go.includes(e)||r.view===e)return;Ne[r.view]?.onHide?.(),r.view=e,Bo(),t&&location.hash.slice(1)!==e&&history.replaceState(null,"","#"+e);for(let n of he.nav.querySelectorAll("button"))n.setAttribute("aria-selected",String(n.dataset.view===e));for(let n of document.querySelectorAll(".view"))n.classList.toggle("active",n.dataset.view===e);document.documentElement.style.setProperty("--stage-dim",e==="deck"?"0.25":"0.72");let o=Ne[e];o?.update&&o.update(),o?.onShow&&o.onShow()}var Cn=performance.now(),po=0,Jt=0,Sa=20;function On(e=performance.now()){requestAnimationFrame(On);let t=Math.min(.1,(e-Cn)/1e3);Cn=e,Oo(t),document.hidden||(Ye.render(e,t),In?.tick(t),Jt+=t,Jt>Sa&&(Jt=0,r.syncToNow()),po+=t,(r.playing||po>.25)&&(po=0,St()),$a(e),En(r))}function St(){let e=r.skyParams();e&&Ye.set(e)}var Dn=0;function $a(e){e-Dn<500||(Dn=e,he.clockTime.textContent=r.fmt.hms(Date.now()))}function ht(e,t,o){Pn.open(e,t,o)}function Qt(){Pn.close()}function Rn(){ht(`
    <div class="hd">LOCATION<span class="rule"></span><span class="val">ENTER TO SELECT \xB7 ESC TO CLOSE</span></div>
    <input class="search-input" id="q" placeholder="search any city, or paste  lat, lon" autocomplete="off" spellcheck="false">
    <button class="tl-btn" id="useloc" style="margin-top:8px">\u25CE USE MY LOCATION</button>
    <div class="res-list" id="res"></div>
  `,e=>{let t=e.querySelector("#q"),o=e.querySelector("#res"),n=[],s=0,l=null,w=()=>{n=r.favorites.map(i=>({...i,fav:!0})),y("SAVED")},y=i=>{if(!n.length){o.innerHTML=`<h3>${i}</h3><div class="nodata">no results</div>`;return}o.innerHTML=`<h3>${i}</h3>`+n.map((f,k)=>`
        <div class="res-item ${k===s?"sel":""}" data-i="${k}">
          <div>
            <b>${ut(f.name)}</b><br>
            <span>${ut([f.admin1,f.country||f.country_code].filter(Boolean).join(" \xB7 "))}</span>
          </div>
          <span class="coord">${(+f.latitude).toFixed(2)}, ${(+f.longitude).toFixed(2)}</span>
          ${f.fav?`<button class="rm" data-rm="${k}" title="Remove">\xD7</button>`:""}
        </div>`).join("")},S=async i=>{let f=n[i];f&&(r.addFavorite(f),Qt(),await r.setLocation(f),St())};o.addEventListener("click",i=>{let f=i.target.closest("[data-rm]");if(f){i.stopPropagation(),r.removeFavorite(+f.dataset.rm),w();return}let k=i.target.closest("[data-i]");k&&S(+k.dataset.i)}),t.addEventListener("input",()=>{clearTimeout(l);let i=t.value.trim();if(!i){w();return}let f=i.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);if(f){let k=+f[1],u=+f[2];if(Math.abs(k)<=90&&Math.abs(u)<=180){n=[{name:`${k.toFixed(4)}, ${u.toFixed(4)}`,admin1:"coordinate",latitude:k,longitude:u}],s=0,y("COORDINATE");return}}l=setTimeout(async()=>{try{n=(await ce.geocode(i)).results||[],s=0,y("RESULTS")}catch{n=[],y("RESULTS")}},220)}),t.addEventListener("keydown",i=>{i.key==="ArrowDown"?(s=Math.min(n.length-1,s+1),y(o.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="ArrowUp"?(s=Math.max(0,s-1),y(o.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="Enter"&&(S(s),i.preventDefault())});let v=e.querySelector("#useloc");!navigator.geolocation||!window.isSecureContext?v.remove():v.addEventListener("click",()=>{v.textContent="\u25CE LOCATING\u2026",navigator.geolocation.getCurrentPosition(async i=>{let f=i.coords.latitude,k=i.coords.longitude,u=`${f.toFixed(2)}, ${k.toFixed(2)}`,d="",p="";try{let a=await ce.reverse(f,k);u=a.city||a.locality||a.principalSubdivision||u,d=a.principalSubdivision||"",p=a.countryCode||""}catch{}r.settings.geo="set",Qt(),await r.setLocation({name:u,admin1:d,country_code:p,latitude:f,longitude:k}),St()},i=>{v.textContent=i.code===i.PERMISSION_DENIED?"\u25CE LOCATION BLOCKED IN BROWSER":"\u25CE LOCATION UNAVAILABLE"},{timeout:8e3,maximumAge:30*6e4})}),w(),t.focus()})}function Nn(){let e=r.alerts;if(!e.length){ht(`<div class="hd">ALERTS<span class="rule"></span></div>
      <div class="nodata">no active watches, warnings or advisories for this location</div>`);return}ht(`
    <div class="hd" style="--ac:var(--rd)">ACTIVE ALERTS<span class="rule"></span><span class="val">${e.length}</span></div>
    <div class="res-list">
      ${e.map(t=>`
        <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)">
          <b style="color:#f47171;font-size:.82rem;letter-spacing:.08em">${ut(t.event)}</b>
          <div style="font-family:var(--mono);font-size:max(.6rem,var(--fs-floor,0px));color:var(--faint);margin:3px 0 6px">
            ${ut(t.senderName||"")} \xB7 until ${r.fmt.weekday(t.expires)} ${r.fmt.hm(t.expires)}
          </div>
          <div style="font-size:max(.72rem,var(--fs-floor,0px));color:var(--dim);line-height:1.5;white-space:pre-wrap">${ut((t.description||"").slice(0,900))}</div>
          ${t.instruction?`<div style="margin-top:7px;font-size:max(.7rem,var(--fs-floor,0px));color:var(--am);line-height:1.5">${ut(t.instruction.slice(0,400))}</div>`:""}
        </div>`).join("")}
    </div>
  `)}function Hn(e){let t=ne.manual;ht(`
    <div class="hd">SETTINGS<span class="rule"></span><span class="val">ATMOS//NET v1.0.0</span></div>
    <div class="setrow">
      <label>Render quality<span class="hint">Auto adapts to power state and measured frame rate</span></label>
      <div class="seg" id="qseg">
        ${["auto","0","1","2","3"].map(o=>`<button data-q="${o}" class="${String(t)===o||t==null&&o==="auto"?"on":""}">${o}</button>`).join("")}
      </div>
    </div>
    <div class="setrow">
      <label>Ambient audio<span class="hint">Generative soundscape matched to live conditions</span></label>
      <div class="seg"><button id="sndT" class="${nt()?"on":""}">${nt()?"on":"off"}</button></div>
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
  `,o=>{o.querySelector("#qseg").addEventListener("click",n=>{let s=n.target.closest("[data-q]");s&&(ro(s.dataset.q==="auto"?null:+s.dataset.q),o.querySelectorAll("[data-q]").forEach(l=>l.classList.toggle("on",l===s)))}),o.querySelector("#sndT").addEventListener("click",n=>{vo(),n.target.textContent=nt()?"on":"off",n.target.classList.toggle("on",nt())}),o.querySelector("#voiceT").addEventListener("click",n=>{r.settings.voice=!r.settings.voice,r.save(),n.target.textContent=r.settings.voice?"on":"off",n.target.classList.toggle("on",r.settings.voice)})},e?.currentTarget)}function vo(){let e=!nt();kn(),Tn(e),r.settings.sound=e,r.save(),he.soundBtn.classList.toggle("on",e)}function ka(e){e?.public&&(r.settings.geo||!navigator.geolocation||!window.isSecureContext||navigator.geolocation.getCurrentPosition(async t=>{let o=t.coords.latitude,n=t.coords.longitude,s=`${o.toFixed(2)}, ${n.toFixed(2)}`,l="",w="";try{let y=await ce.reverse(o,n);s=y.city||y.locality||y.principalSubdivision||s,l=y.principalSubdivision||"",w=y.countryCode||""}catch{}r.settings.geo="set",await r.setLocation({name:s,admin1:l,country_code:w,latitude:o,longitude:n}),St()},t=>{t.code===t.PERMISSION_DENIED&&(r.settings.geo="denied",r.save())},{timeout:8e3,maximumAge:30*6e4,enableHighAccuracy:!1}))}function Ta(e){if(e.defaultPrevented||e.isComposing)return;if(e.target.closest?.('input, textarea, select, button, a[href], summary, [contenteditable], [role="button"], [role="link"], [role="slider"], [role="textbox"], [role="combobox"]')){e.key==="Escape"&&Qt();return}if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest?.('[aria-modal="true"]'))return;let t=e.key;if(t==="Escape"){Qt();return}if(t>="1"&&t<="6"){Mt(go[+t-1]);return}switch(t.toLowerCase()){case" ":r.playing=!r.playing,r.playing&&r.view!=="radar"&&(r.following=!1),r.playing&&r.cursor>=r.span.hi-6e4&&r.setCursor(Date.now()),r.emit("play",r.playing),e.preventDefault();break;case"arrowleft":r.playing=!1,r.scrubTo(r.cursor-(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"arrowright":r.playing=!1,r.scrubTo(r.cursor+(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"n":r.toNow();break;case"/":Rn(),e.preventDefault();break;case"a":Nn();break;case"b":fo(r,ht);break;case"s":vo();break;case",":Hn();break;case"r":r.refresh();break;case"f":document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();break;default:break}}var ut=te;ba().catch(e=>{console.error(e),Te(`FATAL: ${e.message}`,"err")});window.ATMOS={store:r,sky:Ye,perf:ne,setView:Mt,views:Ne};export{Qt as closeModal,ht as openModal};
