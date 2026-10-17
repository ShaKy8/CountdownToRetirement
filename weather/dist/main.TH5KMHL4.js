import{a as Ze,b as Fe,c as ze,d as kt,e as pt,f as Je,g as Qe,h as Mo,i as So,j as Oe,k as Tt}from"./chunk.7JX7BFLW.js";var Wn=new URL("./",location.href);async function Me(e,t){let o=new URL(e.replace(/^\//,""),Wn);for(let[s,d]of Object.entries(t||{}))d!=null&&o.searchParams.set(s,d);let n=await fetch(o,{cache:"no-store"});if(!n.ok)throw new Error(`${e} -> ${n.status}`);return n.json()}var ce={config:()=>Me("/api/config"),bundle:(e,t)=>Me("/api/bundle",{lat:e,lon:t}),climate:(e,t)=>Me("/api/climate",{lat:e,lon:t}),models:(e,t)=>Me("/api/models",{lat:e,lon:t}),pollen:(e,t)=>Me("/api/pollen",{lat:e,lon:t}),observations:(e,t)=>Me("/api/observations",{lat:e,lon:t}),radar:()=>Me("/api/radar"),space:()=>Me("/api/space"),aurora:()=>Me("/api/aurora"),iss:()=>Me("/api/iss"),aircraft:(e,t,o)=>Me("/api/aircraft",{lat:e,lon:t,dist:o}),flight:(e,t)=>Me("/api/flight",{cs:e,hex:t}),elsewhere:e=>Me("/api/elsewhere",{q:e}),geocode:e=>Me("/api/geocode",{q:e}),reverse:(e,t)=>Me("/api/reverse",{lat:e,lon:t})};var Un={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"},oe=e=>String(e??"").replace(/[<>&"']/g,t=>Un[t]),H=(e,t,o)=>Math.min(o,Math.max(t,e)),Et=(e,t,o)=>e+(t-e)*o;var Y={temp:e=>e==null?"--":`${Math.round(e)}\xB0`,tempP:e=>e==null?"--":`${e.toFixed(1)}\xB0`,pct:e=>e==null?"--":`${Math.round(e)}%`,wind:e=>e==null?"--":`${Math.round(e)}`,pressure:e=>e==null?"--":(e*.029529983071445).toFixed(2),inches:e=>e==null?"--":e<.01&&e>0?"<0.01":e.toFixed(2),miles:e=>e==null?"--":e>=1609*9?"10+":(e/1609.344).toFixed(1),int:e=>e==null?"--":String(Math.round(e)),signed:(e,t=1)=>e==null?"--":`${e>=0?"+":"\u2212"}${Math.abs(e).toFixed(t)}`},Gn=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"],me=e=>e==null?"--":Gn[Math.round((e%360+360)%360/22.5)%16];function it(e){if(e==null)return"--";let t=Math.floor(e/3600),o=Math.round(e%3600/60);return t?`${t}h ${String(o).padStart(2,"0")}m`:`${o}m`}function eo(e){let t=e-Date.now(),o=Math.abs(t),n=Math.round(o/6e4);if(n<1)return"now";let s=n<60?`${n} min`:`${Math.floor(n/60)}h ${String(n%60).padStart(2,"0")}m`;return t>0?`in ${s}`:`${s} ago`}var $o={0:["CLEAR","Clear sky","clear",0],1:["MAINLY CLEAR","Mainly clear","clear",0],2:["PARTLY CLOUDED","Partly cloudy","cloud",.4],3:["OVERCAST","Overcast","cloud",1],45:["FOG","Fog","fog",.7],48:["RIME FOG","Depositing rime fog","fog",1],51:["LIGHT DRIZZLE","Light drizzle","rain",.2],53:["DRIZZLE","Moderate drizzle","rain",.35],55:["DENSE DRIZZLE","Dense drizzle","rain",.5],56:["FREEZING DRIZZLE","Light freezing drizzle","rain",.3],57:["FREEZING DRIZZLE+","Dense freezing drizzle","rain",.5],61:["LIGHT RAIN","Slight rain","rain",.35],63:["RAIN","Moderate rain","rain",.6],65:["HEAVY RAIN","Heavy rain","rain",1],66:["FREEZING RAIN","Light freezing rain","rain",.5],67:["FREEZING RAIN+","Heavy freezing rain","rain",.9],71:["LIGHT SNOW","Slight snow fall","snow",.3],73:["SNOW","Moderate snow fall","snow",.6],75:["HEAVY SNOW","Heavy snow fall","snow",1],77:["SNOW GRAINS","Snow grains","snow",.3],80:["RAIN SHOWERS","Slight rain showers","rain",.45],81:["RAIN SHOWERS","Moderate rain showers","rain",.7],82:["VIOLENT SHOWERS","Violent rain showers","rain",1],85:["SNOW SHOWERS","Slight snow showers","snow",.5],86:["HEAVY SNOW SHOWERS","Heavy snow showers","snow",1],95:["THUNDERSTORM","Thunderstorm","storm",.7],96:["T-STORM + HAIL","Thunderstorm with slight hail","storm",.85],99:["SEVERE T-STORM","Thunderstorm with heavy hail","storm",1]};function Xe(e){let t=$o[e]||$o[0];return{code:e,label:t[0],long:t[1],kind:t[2],intensity:t[3]}}function to(e,t=!0){let o=Xe(e).kind;return o==="clear"?e===0?t?"\u2600":"\u263E":t?"\u26C5":"\u2601":o==="cloud"?e===3?"\u2601":t?"\u26C5":"\u2601":o==="fog"?"\u2591":o==="rain"?"\u2614":o==="snow"?"\u2744":o==="storm"?"\u26A1":"\u25CB"}function _e(e){return e==null?{name:"NO DATA",color:"#8d9aab",level:0}:e<=50?{name:"GOOD",color:"#8fdc6a",level:1}:e<=100?{name:"MODERATE",color:"#ecd46a",level:2}:e<=150?{name:"SENSITIVE GROUPS",color:"#f59a5b",level:3}:e<=200?{name:"UNHEALTHY",color:"#f47171",level:4}:e<=300?{name:"VERY UNHEALTHY",color:"#c89af5",level:5}:{name:"HAZARDOUS",color:"#ef5a6a",level:6}}function qe(e){return e==null?{name:"NO DATA",color:"#8d9aab"}:e<3?{name:"LOW",color:"#8fdc6a"}:e<6?{name:"MODERATE",color:"#ecd46a"}:e<8?{name:"HIGH",color:"#f59a5b"}:e<11?{name:"VERY HIGH",color:"#f47171"}:{name:"EXTREME",color:"#c89af5"}}var ko=[null,200,250,300,450,600,1e3];function At(e,t=3){if(!e||e<=.1)return null;let o=ko[t]??ko[3];return Math.round(o/(e*1.5))}function gt(e){return e==null?{name:"NO DATA",color:"#8d9aab"}:e<2.5?{name:"LOW",color:"#8fdc6a"}:e<4.9?{name:"LOW-MED",color:"#c6dc6e"}:e<7.3?{name:"MEDIUM",color:"#ecd46a"}:e<9.7?{name:"MED-HIGH",color:"#f59a5b"}:{name:"HIGH",color:"#f47171"}}function Lt(e){return e==null?{name:"NO DATA",color:"#8d9aab",lat:null}:e<3?{name:"QUIET",color:"#6bb3bd",lat:66}:e<4?{name:"UNSETTLED",color:"#3fd0d8",lat:63}:e<5?{name:"ACTIVE",color:"#8fdc6a",lat:60}:e<6?{name:"G1 STORM",color:"#ecd46a",lat:56}:e<7?{name:"G2 STORM",color:"#f59a5b",lat:53}:e<8?{name:"G3 STORM",color:"#f47171",lat:50}:e<9?{name:"G4 STORM",color:"#c89af5",lat:47}:{name:"G5 EXTREME",color:"#ef5a6a",lat:42}}function Ct(e){return e==null?{name:"--",effect:""}:e<1?{name:"CALM",effect:"smoke rises vertically"}:e<4?{name:"LIGHT AIR",effect:"smoke drifts"}:e<8?{name:"LIGHT BREEZE",effect:"leaves rustle"}:e<13?{name:"GENTLE BREEZE",effect:"flags extend"}:e<19?{name:"MODERATE",effect:"dust and paper lift"}:e<25?{name:"FRESH BREEZE",effect:"small trees sway"}:e<32?{name:"STRONG BREEZE",effect:"umbrellas fail"}:e<39?{name:"NEAR GALE",effect:"walking is work"}:e<47?{name:"GALE",effect:"twigs break off"}:e<55?{name:"STRONG GALE",effect:"shingles lift"}:e<64?{name:"STORM",effect:"trees uprooted"}:e<73?{name:"VIOLENT STORM",effect:"widespread damage"}:{name:"HURRICANE",effect:"devastation"}}function Ve(e){return e==null?{name:"--",color:"#8d9aab",note:""}:e<30?{name:"VERY DRY",color:"#7fb2f0",note:"static, chapped lips"}:e<45?{name:"DRY",color:"#3fd0d8",note:"crisp and comfortable"}:e<55?{name:"COMFORTABLE",color:"#8fdc6a",note:"ideal"}:e<60?{name:"STICKY",color:"#c6dc6e",note:"noticeable humidity"}:e<65?{name:"HUMID",color:"#ecd46a",note:"uncomfortable"}:e<70?{name:"OPPRESSIVE",color:"#f59a5b",note:"sweat does not evaporate"}:e<75?{name:"MISERABLE",color:"#f47171",note:"dangerous for exertion"}:{name:"LETHAL",color:"#ef5a6a",note:"limit outdoor exposure"}}function vt(e="",t=""){let o=e.toLowerCase();return/tornado|hurricane|extreme|tsunami/.test(o)?"#ef5a6a":/warning/.test(o)?"#f47171":/watch/.test(o)?"#f59a5b":/advisory|statement/.test(o)?"#ecd46a":t==="Extreme"||t==="Severe"?"#f47171":"#3fd0d8"}function Dt(e){let t=f=>new Intl.DateTimeFormat("en-US",{timeZone:e,...f}),o=t({hour:"2-digit",minute:"2-digit",hour12:!1}),n=t({hour:"numeric",minute:"2-digit",hour12:!0}),s=t({hour:"numeric",hour12:!0}),d=t({weekday:"short"}),g=t({month:"short",day:"numeric"}),v=t({weekday:"long",month:"long",day:"numeric"}),y=t({hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),M=f=>{if(f==null)return null;let l=new Date(f);return Number.isNaN(+l)?null:l},i=f=>l=>{let p=M(l);return p?f.format(p):"--"},c=new Intl.DateTimeFormat("en-CA",{timeZone:e}),S=new Intl.DateTimeFormat("en-US",{timeZone:e,hour:"numeric",minute:"numeric",hour12:!1});return{hm:i(o),hm12:i(n),hour:i(s),weekday:i(d),monthDay:i(g),full:i(v),hms:i(y),isoDate:f=>{let l=M(f);return l?c.format(l):"--"},hourOfDay:f=>{let l=M(f);if(!l)return NaN;let p=S.formatToParts(l),a=u=>+p.find(m=>m.type===u)?.value;return a("hour")%24+a("minute")/60}}}function To(e,t){let o=new Date(e);if(Number.isNaN(+o))return NaN;let n=new Intl.DateTimeFormat("en-CA",{timeZone:t}).format(o),[,s,d]=n.split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][s-1]+d-1}var Eo="atmos.v1";function no(e,t){if(!e||typeof e!="object")return null;let o=e.latitude??e.lat,n=e.longitude??e.lon,s=d=>(typeof d=="number"||typeof d=="string"&&d.trim()!=="")&&Number.isFinite(+d);return!s(o)||!s(n)||Math.abs(+o)>90||Math.abs(+n)>180?null:{name:e.name,admin1:e.admin1||"",country:e.country_code||e.country||"",lat:+o,lon:+n,tz:e.timezone||e.tz||t,elevation:e.elevation??null}}function Ao(e){let t=no(e);return t&&{name:t.name,admin1:t.admin1,country_code:t.country,latitude:t.lat,longitude:t.lon,timezone:t.tz}}var ao=e=>typeof e=="string"&&e?`${e.includes("T")?e:`${e}T00:00:00`}Z`:"",Po=e=>t=>Date.parse(ao(t))-e*1e3;function It(e,t,o){if(!e?.time?.length)return[];let n=Po(t),s=e.time.length,d=new Array(s);for(let g=0;g<s;g++){let v={t:n(e.time[g]),i:g};for(let[y,M]of Object.entries(o))v[y]=e[M]?.[g]??null;d[g]=v}return d}var Lo={temp:"temperature_2m",rh:"relative_humidity_2m",dew:"dew_point_2m",feels:"apparent_temperature",pop:"precipitation_probability",precip:"precipitation",rain:"rain",showers:"showers",snow:"snowfall",snowDepth:"snow_depth",code:"weather_code",pressure:"pressure_msl",surfPressure:"surface_pressure",cloud:"cloud_cover",cloudLow:"cloud_cover_low",cloudMid:"cloud_cover_mid",cloudHigh:"cloud_cover_high",vis:"visibility",vpd:"vapour_pressure_deficit",wind:"wind_speed_10m",windDir:"wind_direction_10m",gust:"wind_gusts_10m",uv:"uv_index",uvClear:"uv_index_clear_sky",isDay:"is_day",sunshine:"sunshine_duration",cape:"cape",li:"lifted_index",cin:"convective_inhibition",freezing:"freezing_level_height",blh:"boundary_layer_height",wetbulb:"wet_bulb_temperature_2m",soilT:"soil_temperature_0cm",soilM:"soil_moisture_0_to_1cm",et0:"et0_fao_evapotranspiration"},qn={code:"weather_code",tmax:"temperature_2m_max",tmin:"temperature_2m_min",feelsMax:"apparent_temperature_max",feelsMin:"apparent_temperature_min",sunriseS:"sunrise",sunsetS:"sunset",daylight:"daylight_duration",sunshine:"sunshine_duration",uvMax:"uv_index_max",precip:"precipitation_sum",rain:"rain_sum",showers:"showers_sum",snow:"snowfall_sum",precipHours:"precipitation_hours",pop:"precipitation_probability_max",windMax:"wind_speed_10m_max",gustMax:"wind_gusts_10m_max",windDir:"wind_direction_10m_dominant",radiation:"shortwave_radiation_sum",et0:"et0_fao_evapotranspiration"},Co={precip:"precipitation",code:"weather_code",cape:"cape",vis:"visibility",gust:"wind_gusts_10m",isDay:"is_day"},Do={aqi:"us_aqi",pm10:"pm10",pm25:"pm2_5",co:"carbon_monoxide",no2:"nitrogen_dioxide",so2:"sulphur_dioxide",o3:"ozone",aod:"aerosol_optical_depth",dust:"dust",uv:"uv_index",alder:"alder_pollen",birch:"birch_pollen",grass:"grass_pollen",mugwort:"mugwort_pollen",olive:"olive_pollen",ragweed:"ragweed_pollen"},Vn=.3048;function Io(e,t,o){if(!t||!e?.length)return;let n=Object.entries(o).filter(([,s])=>t[s]==="ft").map(([s])=>s);if(n.length)for(let s of e)for(let d of n)s[d]!=null&&(s[d]*=Vn)}var jn=new Set(["code","isDay","i"]);function Kn(e,t,o){if(!e)return t?{...t}:null;if(!t)return{...e};let n={};for(let s in e){let d=e[s],g=t[s];if(jn.has(s)){n[s]=o<.5?d:g;continue}typeof d=="number"&&typeof g=="number"?n[s]=s==="windDir"?((d+(((g-d)%360+540)%360-180)*o)%360+360)%360:Et(d,g,o):n[s]=d??g}return n}function oo(e,t){if(!e?.length)return null;if(t<=e[0].t)return{...e[0]};if(t>=e.at(-1).t)return{...e.at(-1)};let o=e[1].t-e[0].t,n=(t-e[0].t)/o,s=H(Math.floor(n),0,e.length-2);return Kn(e[s],e[s+1],n-s)}var so=class{constructor(){this.listeners=new Map,this.requestId=0,this.pendingLocation=null,this.pendingRemember=!0,this.loc=null,this.tz=Intl.DateTimeFormat().resolvedOptions().timeZone,this.fmt=Dt(this.tz),this.raw=null,this.hours=[],this.days=[],this.min15=[],this.air=[],this.airNow=null,this.alerts=[],this.space=null,this.climate=null,this.models=null,this.pollen=null,this.radar=null,this.observed=null,this.cursor=Date.now(),this.now=Date.now(),this.following=!0,this.playing=!1,this.playRate=1,this.view="deck",this.status="boot",this.lastFetch=0,this.favorites=[],this.settings={sound:!1,skinType:3,voice:!0},this.restore()}on(t,o){return this.listeners.has(t)||this.listeners.set(t,new Set),this.listeners.get(t).add(o),()=>this.listeners.get(t).delete(o)}emit(t,o){for(let n of this.listeners.get(t)||[])try{n(o)}catch(s){console.error(`[store:${t}]`,s)}}restore(){try{let t=JSON.parse(localStorage.getItem(Eo)||"{}");t.loc&&(this.loc=no(t.loc,this.tz)),Array.isArray(t.favorites)&&(this.favorites=t.favorites.map(Ao).filter(Boolean)),t.settings&&Object.assign(this.settings,t.settings)}catch{}}save(){try{localStorage.setItem(Eo,JSON.stringify({loc:this.loc,favorites:this.favorites,settings:this.settings}))}catch{}}setStatus(t){this.status=t,this.emit("status",t)}async setLocation(t,{remember:o=!0}={}){let n=no(t,this.tz);n&&(this.pendingLocation=n,this.pendingRemember=o,await this.refresh({full:!0}))}addFavorite(t){let o=s=>`${(+(s.lat??s.latitude)).toFixed(3)},${(+(s.lon??s.longitude)).toFixed(3)}`,n=Ao(t);n&&(this.favorites=this.favorites.filter(s=>o(s)!==o(n)),this.favorites.unshift(n),this.favorites=this.favorites.slice(0,12),this.save(),this.emit("favorites",this.favorites))}removeFavorite(t){this.favorites.splice(t,1),this.save(),this.emit("favorites",this.favorites)}async refresh({full:t=!1}={}){let o=this.pendingLocation||this.loc;if(!o)return;let{lat:n,lon:s}=o,d=this.pendingLocation,g=this.pendingRemember,v=++this.requestId,y=()=>v===this.requestId;t=t||!!d,this.setStatus("load");try{let i=await ce.bundle(n,s);if(!y())return;if(!i.forecast?.ok||!Array.isArray(i.forecast.data?.hourly?.time)||!i.forecast.data.hourly.time.length)throw new Error(`Forecast unavailable for ${o.name||"this location"}`);let c=i.forecast.data.timezone||o.tz,S=Dt(c),f={loc:{...o,tz:c},tz:c,fmt:S,following:this.following,cursor:this.cursor};this.ingest.call(f,i),(!this.loc||this.loc.lat!==n||this.loc.lon!==s)&&(this.climate=this.models=this.pollen=this.observed=this.radar=null),Object.assign(this,f),this.pendingLocation=null,d&&g&&this.save(),this.lastFetch=Date.now(),this.setStatus("ok"),d&&this.emit("loc",this.loc),this.emit("data",this)}catch(i){if(!y())return;console.error("[store] bundle failed",i),this.setStatus("err"),this.emit("error",i);return}let M=[ce.radar().then(i=>{y()&&(this.radar=i,this.emit("radar",i))}),ce.pollen(n,s).then(i=>{y()&&(this.pollen=i,this.emit("pollen",i))}),ce.observations(n,s).then(i=>{y()&&(this.observed=i,this.emit("observed",i))})];(t||!this.climate)&&M.push(ce.climate(n,s).then(i=>{y()&&(this.climate=i,this.emit("climate",i))})),(t||!this.models)&&M.push(ce.models(n,s).then(i=>{y()&&(this.models=this.reduceModels(i),this.emit("models",this.models))})),Promise.allSettled(M).then(()=>{y()&&this.emit("data",this)})}ingest(t){this.raw=t;let o=t.forecast?.ok?t.forecast.data:null;if(o){let s=o.utc_offset_seconds??0;this.utcOffset=s,this.elevation=o.elevation,o.timezone&&o.timezone!==this.tz&&(this.tz=o.timezone,this.fmt=Dt(this.tz),this.loc&&(this.loc.tz=o.timezone)),this.hours=It(o.hourly,s,Lo),this.min15=It(o.minutely_15,s,Co),Io(this.hours,o.hourly_units,Lo),Io(this.min15,o.minutely_15_units,Co),this.days=It(o.daily,s,qn).map(d=>({...d,sunrise:d.sunriseS?Date.parse(ao(d.sunriseS))-s*1e3:null,sunset:d.sunsetS?Date.parse(ao(d.sunsetS))-s*1e3:null}))}let n=t.air?.ok?t.air.data:null;if(this.air=[],this.airNow=null,n&&(this.air=It(n.hourly,n.utc_offset_seconds??0,Do),this.airNow=n.current?Object.fromEntries(Object.entries(Do).map(([s,d])=>[s,n.current[d]??null])):null),this.alerts=t.alerts?.ok&&Array.isArray(t.alerts.data?.features)?t.alerts.data.features.filter(s=>s&&typeof s=="object").map(s=>({...s.properties,geometry:s.geometry})):[],this.space=t.space?.ok?t.space.data:null,this.hours.length){let s=this.following?Date.now():this.cursor;this.cursor=H(s,this.hours[0].t,this.hours.at(-1).t)}}reduceModels(t){let o=t?.hourly;if(!o?.time?.length)return null;let n=t.utc_offset_seconds??0,s=Po(n),d=Object.keys(o).filter(v=>v.startsWith("temperature_2m_")).map(v=>v.replace("temperature_2m_","")),g=[];for(let v=0;v<o.time.length;v++){let y=d.map(c=>o[`temperature_2m_${c}`]?.[v]).filter(c=>c!=null),M=d.map(c=>o[`precipitation_${c}`]?.[v]).filter(c=>c!=null);if(!y.length)continue;let i=y.reduce((c,S)=>c+S,0)/y.length;g.push({t:s(o.time[v]),mean:i,min:Math.min(...y),max:Math.max(...y),spread:Math.max(...y)-Math.min(...y),temps:y,precipAgree:M.length?M.filter(c=>c>.004).length/M.length:null})}return{names:d,rows:g}}setCursor(t,{silent:o=!1}={}){if(!this.hours.length)return;let n=this.hours[0].t,s=this.hours.at(-1).t;this.cursor=H(t,n,s),o||this.emit("cursor",this.cursor)}scrubTo(t,o){this.following=!1,this.setCursor(t,o)}syncToNow(){if(!this.following||this.playing||this.view==="radar")return;let t=Date.now();Math.abs(t-this.cursor)<1e3||this.setCursor(t)}toNow(){this.playing=!1,this.following=!0,this.setCursor(Date.now()),this.emit("play",!1)}get atNow(){return Math.abs(this.cursor-Date.now())<9e4}get span(){return this.hours.length?{lo:this.hours[0].t,hi:this.hours.at(-1).t}:{lo:0,hi:0}}frame(t=this.cursor){let o=oo(this.hours,t);if(!o)return null;let n={...o,t},s=oo(this.min15,t);s&&Math.abs(s.t-t)<30*6e4&&s.precip!=null&&(n.precip=s.precip,n.code=s.code??n.code,s.cape!=null&&(n.cape=s.cape),s.vis!=null&&(n.vis=s.vis),s.gust!=null&&(n.gust=s.gust));let d=oo(this.air,t);d&&(n.air=d),n.wx=Xe(Math.round(n.code??0)),n.day=this.dayFor(t);let{lat:g,lon:v}=this.loc||{lat:0,lon:0},y=new Date(t),M=Ze(y,g,v),i=Je(y,g,v),c=Qe(y);return n.sun={alt:M.altitude,az:M.azimuth,altDeg:M.altitude*57.29578,compass:Fe(M.azimuth)},n.moon={alt:i.altitude,az:i.azimuth,altDeg:i.altitude*57.29578,compass:Fe(i.azimuth),phase:c.phase,fraction:c.fraction,distance:i.distance},n}dayFor(t){let o=this.fmt.isoDate(t);return this.days.find(n=>this.fmt.isoDate(n.t)===o)||null}sunTimesFor(t=this.cursor){let{lat:o,lon:n}=this.loc||{lat:0,lon:0};return kt(new Date(t),o,n,this.elevation||0)}moonTimesFor(t=this.cursor){let{lat:o,lon:n}=this.loc||{lat:0,lon:0};return So(new Date(t),o,n)}skyParams(t=this.cursor){let o=this.frame(t);if(!o)return null;let n=o.wx.kind,s=o.precip??0,d=H(s/.12,0,1),g=n==="rain"||n==="snow"||n==="storm"?H(Math.max(o.wx.intensity*.55,d),0,1):d*.6,v=this.currentKp()??2;return{sunAlt:o.sun.alt,sunAz:o.sun.az+Math.PI,moonAlt:o.moon.alt,moonAz:o.moon.az+Math.PI,moonPhase:o.moon.phase,moonFrac:o.moon.fraction,viewAz:this.viewBearing(o),cloudLow:H((o.cloudLow??0)/100,0,1),cloudMid:H((o.cloudMid??0)/100,0,1),cloudHigh:H((o.cloudHigh??0)/100,0,1),precip:g,snow:n==="snow"?1:0,storm:n==="storm"?.85:H((o.cape??0)/2500,0,.6),fog:n==="fog"?.85:H(1-(o.vis??2e4)/6e3,0,.6),wind:o.wind??5,windDir:((o.windDir??0)+180)*Math.PI/180,kp:v,lat:this.loc?.lat??0,haze:H(1-(o.vis??24e3)/24e3,0,.8),cityGlow:.55}}viewBearing(t){let o=(this.loc?.lat??0)>=0?Math.PI:0;return t.sun.altDeg>-8?t.sun.az+Math.PI:t.moon.altDeg>2?t.moon.az+Math.PI:o}currentKp(){let t=this.space?.kpNow;if(t?.ok&&Array.isArray(t.data)&&t.data.length){let o=t.data.at(-1),n=Number(o.estimated_kp??o.kp_index);if(Number.isFinite(n))return n}return null}kpForecast(){let t=this.space?.kpFc;if(!t?.ok||!Array.isArray(t.data)||!t.data.length)return[];let o=t.data;return(Array.isArray(o[0])?o.slice(1).map(s=>({time_tag:s[0],kp:s[1],observed:s[2]})):o).map(s=>({t:Date.parse(String(s.time_tag).replace(" ","T").replace(/Z?$/,"Z")),kp:Number(s.kp??s.kp_index??s.estimated_kp),observed:s.observed})).filter(s=>Number.isFinite(s.kp)&&Number.isFinite(s.t))}},r=new so;var ro=new Set,ae={tier:2,fps:60,onBattery:!1,batteryLevel:1,hidden:!1,reducedMotion:matchMedia("(prefers-reduced-motion: reduce)").matches,manual:null,onChange(e){return ro.add(e),()=>ro.delete(e)}},io=0,Pt=0,Oo=0,dt=0,ct=0;function Ro(e){io++,Pt+=e;let t=performance.now();if(t-Oo<1e3)return;Oo=t,ae.fps=Pt>0?io/Pt:60,io=0,Pt=0,ae.fps<40?(dt++,ct=0):ae.fps>55?(ct++,dt=0):(dt=0,ct=0);let o=rt();o!==ae.tier&&lt(o)}function Yn(){return typeof matchMedia!="function"?!1:matchMedia("(pointer: coarse)").matches&&matchMedia("(max-width: 820px)").matches}function rt(){if(ae.manual!=null)return ae.manual;if(ae.hidden)return 0;if(ae.reducedMotion)return 1;if(Yn()){let t=1;return dt>=3&&(t=Math.max(0,ae.tier-1)),ct>=6&&ae.tier<2&&(t=ae.tier+1),Math.max(0,Math.min(2,t))}let e=ae.onBattery?2:3;return ae.onBattery&&ae.batteryLevel<.25&&(e=1),dt>=3&&(e=Math.max(0,ae.tier-1)),ct>=6&&e>ae.tier&&(e=ae.tier+1),Math.max(0,Math.min(3,e))}function lt(e){ae.tier=e,document.documentElement.dataset.q=String(e),dt=0,ct=0;for(let t of ro)t(e)}function No(){document.addEventListener("visibilitychange",()=>{ae.hidden=document.hidden,lt(rt())}),matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{ae.reducedMotion=e.matches,lt(rt())}),navigator.getBattery&&navigator.getBattery().then(e=>{let t=()=>{ae.onBattery=!e.charging,ae.batteryLevel=e.level,lt(rt())};e.addEventListener("chargingchange",t),e.addEventListener("levelchange",t),t()}).catch(()=>{}),lt(rt())}function lo(e){ae.manual=e,lt(rt())}var xn=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,Zn=`#version 300 es
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
}`,Ho={sunAlt:.4,sunAz:3,moonAlt:-.4,moonAz:1,moonPhase:.25,moonFrac:.5,viewAz:Math.PI,cloudLow:.2,cloudMid:.1,cloudHigh:.1,precip:0,snow:0,storm:0,fog:0,wind:6,windDir:4,kp:2,lat:33.6,haze:.15,cityGlow:.5},Jn=new Set(["snow","lat"]),Ot=class{constructor(t){this.canvas=t,this.gl=null,this.params={...Ho},this.target={...Ho},this.quality=2,this.running=!1,this.flash=0,this.nextBolt=1/0,this.scale=1,this.ok=!1,this.t0=performance.now()}init(){let t=this.canvas.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1});if(!t)return this.ok=!1,!1;this.gl=t;let o=Qn(t,xn,Zn);if(!o)return this.ok=!1,!1;this.prog=o,t.useProgram(o);let n=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,n),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let s=t.getAttribLocation(o,"aPos");t.enableVertexAttribArray(s),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0),this.u={};for(let d of["uRes","uTime","uQuality","uSunAlt","uSunAz","uMoonAlt","uMoonAz","uMoonPhase","uMoonFrac","uViewAz","uCloudLow","uCloudMid","uCloudHigh","uPrecip","uSnow","uStorm","uFlash","uFog","uWind","uWindDir","uKp","uLat","uHaze","uCityGlow"])this.u[d]=t.getUniformLocation(o,d);return this.resize(),this.ok=!0,!0}set(t){Object.assign(this.target,t)}snap(t){Object.assign(this.target,t),Object.assign(this.params,t)}setQuality(t){this.quality=t,this.scale=t>=3?1:t===2?.85:t===1?.65:.5,this.resize()}resize(){let t=this.gl;if(!t)return;let o=Math.min(window.devicePixelRatio||1,this.quality>=3?2:1.5),n=Math.max(2,Math.floor(this.canvas.clientWidth*o*this.scale)),s=Math.max(2,Math.floor(this.canvas.clientHeight*o*this.scale));this.canvas.width===n&&this.canvas.height===s||(this.canvas.width=n,this.canvas.height=s,t.viewport(0,0,n,s))}render(t,o){if(!this.ok)return;let n=this.gl,s=this.params,d=this.target,g=1-Math.pow(.0016,o);for(let y in d){if(Jn.has(y)){s[y]=d[y];continue}if(y.endsWith("Az")||y==="windDir"){let M=d[y]-s[y];M=((M+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,s[y]+=M*g}else s[y]+=(d[y]-s[y])*g}s.storm>.12?(this.nextBolt===1/0&&(this.nextBolt=t+Math.random()*3e3),t>this.nextBolt&&(this.flash=.3+Math.random()*.45,this.nextBolt=t+900+Math.random()*9e3*(1.15-s.storm))):this.nextBolt=1/0,this.flash*=Math.pow(8e-5,o),this.flash<.002&&(this.flash=0);let v=this.u;n.uniform2f(v.uRes,this.canvas.width,this.canvas.height),n.uniform1f(v.uTime,(t-this.t0)/1e3),n.uniform1i(v.uQuality,this.quality),n.uniform1f(v.uSunAlt,s.sunAlt),n.uniform1f(v.uSunAz,s.sunAz),n.uniform1f(v.uMoonAlt,s.moonAlt),n.uniform1f(v.uMoonAz,s.moonAz),n.uniform1f(v.uMoonPhase,s.moonPhase),n.uniform1f(v.uMoonFrac,s.moonFrac),n.uniform1f(v.uViewAz,s.viewAz),n.uniform1f(v.uCloudLow,s.cloudLow),n.uniform1f(v.uCloudMid,s.cloudMid),n.uniform1f(v.uCloudHigh,s.cloudHigh),n.uniform1f(v.uPrecip,s.precip),n.uniform1f(v.uSnow,s.snow),n.uniform1f(v.uStorm,s.storm),n.uniform1f(v.uFlash,this.flash),n.uniform1f(v.uFog,s.fog),n.uniform1f(v.uWind,s.wind),n.uniform1f(v.uWindDir,s.windDir),n.uniform1f(v.uKp,s.kp),n.uniform1f(v.uLat,s.lat),n.uniform1f(v.uHaze,s.haze),n.uniform1f(v.uCityGlow,s.cityGlow),n.drawArrays(n.TRIANGLES,0,3)}};function Qn(e,t,o){let n=Fo(e,e.VERTEX_SHADER,t),s=Fo(e,e.FRAGMENT_SHADER,o);if(!n||!s)return null;let d=e.createProgram();return e.attachShader(d,n),e.attachShader(d,s),e.linkProgram(d),e.getProgramParameter(d,e.LINK_STATUS)?(e.deleteShader(n),e.deleteShader(s),d):(console.error("[sky] link failed:",e.getProgramInfoLog(d)),null)}function Fo(e,t,o){let n=e.createShader(t);if(e.shaderSource(n,o),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){let s=e.getShaderInfoLog(n);console.error(`[sky] ${t===e.VERTEX_SHADER?"vertex":"fragment"} compile failed:
${s}`);let d=/ERROR:\s*\d+:(\d+)/.exec(s||"");if(d){let g=o.split(`
`),v=+d[1];console.error(g.slice(Math.max(0,v-3),v+2).map((y,M)=>`${Math.max(1,v-2)+M}| ${y}`).join(`
`))}return null}return n}var j=["#3fd0d8","#f07aa6","#f2b45a","#b39dfa","#7fb2f0"],N={good:"#8fdc6a",warn:"#ecd46a",serious:"#f59a5b",crit:"#f47171"},ye="#dde2e8",pe="#b3bfcc",se="#8d9aab",co="rgba(255,255,255,.055)",Xn="#0f1826",_o="#16212f",ea="500 12px 'JetBrains Mono', ui-monospace, monospace",ke="500 11.5px 'JetBrains Mono', ui-monospace, monospace",we="600 11.5px 'Chakra Petch', system-ui, sans-serif";function Le(e){if(e==null)return pe;let t=[[-20,"#9d8ef5"],[10,"#6aa9f0"],[32,"#3fd0d8"],[50,"#5cd6bc"],[65,"#a2d86a"],[78,"#ecd46a"],[88,"#f59a5b"],[100,"#f47171"],[115,"#f07aa6"]];if(e<=t[0][0])return t[0][1];if(e>=t.at(-1)[0])return t.at(-1)[1];for(let o=0;o<t.length-1;o++){let[n,s]=t[o],[d,g]=t[o+1];if(e>=n&&e<=d)return Be(s,g,(e-n)/(d-n))}return pe}function Be(e,t,o){let n=[1,3,5].map(g=>parseInt(e.slice(g,g+2),16)),s=[1,3,5].map(g=>parseInt(t.slice(g,g+2),16));return`#${n.map((g,v)=>Math.round(Et(g,s[v],H(o,0,1)))).map(g=>g.toString(16).padStart(2,"0")).join("")}`}function V(e,t){let o=[1,3,5].map(n=>parseInt(e.slice(n,n+2),16));return`rgba(${o[0]},${o[1]},${o[2]},${t})`}var et=new Set;function Bo(){for(let e of et)e.hover=null,e.render();et.clear()}var zo=10;function le(e,t,{onPick:o,inspect:n=!0}={}){let s=e.getContext("2d"),d={canvas:e,ctx:s,hover:null,data:null,draw:t,dirty:!0},g=()=>{let m=Math.min(window.devicePixelRatio||1,2),h=e.clientWidth,E=e.clientHeight;if(!h||!E)return;let $=Math.round(h*m),w=Math.round(E*m);(e.width!==$||e.height!==w)&&(e.width=$,e.height=w),s.setTransform(m,0,0,m,0,0),d.w=h,d.h=E,d.render()};d.render=()=>{if(!(!d.w||!d.h)){s.clearRect(0,0,d.w,d.h);try{t(s,d.w,d.h,d.hover,d.data)}catch(m){console.error("[chart]",m.stack||m)}}},d.update=m=>{d.data=m,d.render()};let v=new ResizeObserver(g);v.observe(e),n&&(e.style.touchAction="pan-y");let y=m=>{let h=e.getBoundingClientRect();return{x:m.clientX-h.left,y:m.clientY-h.top}},M=m=>!!m.pointerType&&m.pointerType!=="mouse",i=(m,h)=>{d.hover={x:m.x,y:m.y,coarse:h},d.render()},c=()=>{et.delete(d),d.hover=null,d.render()},S=null,f=m=>{if(!M(m)){i(y(m),!1);return}S&&(S.moved=Math.max(S.moved,Math.hypot(m.clientX-S.cx,m.clientY-S.cy)),n&&i(y(m),!0))},l=m=>{let h=y(m);if(S={x:h.x,y:h.y,cx:m.clientX,cy:m.clientY,moved:0,coarse:M(m)},!S.coarse||!n)return;let E=d.hover;S.dismiss=!!E&&!!E.coarse&&Math.abs(E.x-h.x)<14&&Math.abs(E.y-h.y)<14;for(let $ of et)$!==d&&($.hover=null,$.render());et.clear(),et.add(d),i(h,!0)},p=m=>{let h=S;S=null,h&&(h.coarse&&n&&h.dismiss&&h.moved<zo&&c(),o&&h.moved<zo&&o({x:h.x,y:h.y,w:d.w,h:d.h},m))},a=()=>{S&&S.coarse&&n&&c(),S=null},u=m=>{M(m)||(d.hover=null,d.render())};return e.addEventListener("pointermove",f),e.addEventListener("pointerdown",l),e.addEventListener("pointerup",p),e.addEventListener("pointercancel",a),e.addEventListener("pointerleave",u),o&&(e.style.cursor="crosshair"),d.destroy=()=>{v.disconnect(),et.delete(d),e.removeEventListener("pointermove",f),e.removeEventListener("pointerdown",l),e.removeEventListener("pointerup",p),e.removeEventListener("pointercancel",a),e.removeEventListener("pointerleave",u)},g(),d}function Te(e,t,o,{width:n=2,glow:s=12,closed:d=!1}={}){if(t.length<2)return;let g=()=>{e.beginPath(),e.moveTo(t[0][0],t[0][1]);for(let v=1;v<t.length;v++)e.lineTo(t[v][0],t[v][1]);d&&e.closePath()};e.lineJoin="round",e.lineCap="round",s&&(e.save(),e.shadowColor=o,e.shadowBlur=s/2,e.strokeStyle=V(o,.55),e.lineWidth=n,g(),e.stroke(),e.restore()),e.strokeStyle=o,e.lineWidth=n,g(),e.stroke()}function Re(e,t){if(!(t.length<2)){e.moveTo(t[0][0],t[0][1]);for(let o=0;o<t.length-1;o++){let n=t[Math.max(0,o-1)],s=t[o],d=t[o+1],g=t[Math.min(t.length-1,o+2)];e.bezierCurveTo(s[0]+(d[0]-n[0])/6,s[1]+(d[1]-n[1])/6,d[0]-(g[0]-s[0])/6,d[1]-(g[1]-s[1])/6,d[0],d[1])}}}function Ie(e,t,o,n=String,{color:s=co,label:d=!0}={}){e.save(),e.strokeStyle=s,e.lineWidth=1,e.font=ke,e.fillStyle=se,e.textAlign="right",e.textBaseline="middle";let g=-1e9;for(let{v,y}of o){if(e.beginPath(),e.moveTo(t.x,Math.round(y)+.5),e.lineTo(t.x+t.w,Math.round(y)+.5),e.stroke(),!d)continue;let M=y-t.y<9?y+6:y-5;Math.abs(M-g)<14||(Ce(e,n(v),t.x+t.w-2,M),g=M)}e.restore()}function je(e,t,o,n,s,d,g=3){let v=Math.abs(s-o);if(v<.4)return;let y=Math.min(g,n/2,v);e.beginPath(),e.moveTo(t,s),e.lineTo(t,o+y),e.quadraticCurveTo(t,o,t+y,o),e.lineTo(t+n-y,o),e.quadraticCurveTo(t+n,o,t+n,o+y),e.lineTo(t+n,s),e.closePath(),e.fillStyle=d,e.save(),e.globalAlpha*=.6,e.fill(),e.clip(),e.globalAlpha/=.6,e.fillRect(t,o,n,Math.min(2.5,v)),e.restore()}function Ce(e,t,o,n,s=3){e.save(),e.lineWidth=s,e.lineJoin="round",e.strokeStyle=V(_o,.9),e.strokeText(t,o,n),e.restore(),e.fillText(t,o,n)}function Se(e,t,o,n,s=se,d="left"){e.save(),e.font=we,e.fillStyle=s,e.textAlign=d,e.textBaseline="top",e.letterSpacing="1.4px",Ce(e,n.toUpperCase(),t,o),e.restore()}function tt(e,t,o,n,s,d,g="#3fd0d8",{pin:v=!1}={}){e.save(),e.font=ea;let i=Math.max(...n.map(p=>e.measureText(p.replace(/\|/g,"  ")).width))+14,c=n.length*13+14-2,S,f;v?(S=t>s/2?4:Math.max(4,s-i-4),f=o<d/2?Math.max(4,d-c-4):4):(S=t+12,f=H(o-c-10,4,d-c-4),S+i>s-4&&(S=t-i-12),S=H(S,4,Math.max(4,s-i-4))),e.fillStyle=V(_o,.94),e.strokeStyle=V(g,.5),e.lineWidth=1;let l=5;e.beginPath(),e.moveTo(S,f+l),e.lineTo(S+l,f),e.lineTo(S+i,f),e.lineTo(S+i,f+c-l),e.lineTo(S+i-l,f+c),e.lineTo(S,f+c),e.closePath(),e.fill(),e.stroke(),e.textBaseline="top",n.forEach((p,a)=>{let[u,m]=p.split("|");e.textAlign="left",e.fillStyle=a===0?g:pe,e.fillText(u,S+7,f+7+a*13),m!=null&&(e.textAlign="right",e.fillStyle=a===0?g:ye,e.fillText(m,S+i-7,f+7+a*13))}),e.restore()}function ta(e,t,o,n,{align:s="left"}={}){e.save(),e.font=we,e.textBaseline="middle",e.letterSpacing="1.2px";let d=0,g=n.map(y=>{let M=e.measureText(y.label.toUpperCase()).width+16;return d+=M,M}),v=s==="right"?t-d:t;n.forEach((y,M)=>{e.fillStyle=y.color,y.dash?(e.strokeStyle=y.color,e.lineWidth=2,e.setLineDash([3,2]),e.beginPath(),e.moveTo(v,o),e.lineTo(v+9,o),e.stroke(),e.setLineDash([])):e.fillRect(v,o-3,9,3),e.fillStyle=pe,e.textAlign="left",e.fillText(y.label.toUpperCase(),v+13,o),v+=g[M]}),e.restore()}function Wo(e,t,o,n,s){e.save(),e.fillStyle="rgba(8,13,22,.32)";for(let d of o){if(!d.sunset||!d.sunrise)continue;let g=o[o.indexOf(d)+1],v=n(d.sunset),y=g?.sunrise?n(g.sunrise):t.x+t.w,M=H(v,t.x,t.x+t.w),i=H(y,t.x,t.x+t.w);i>M&&e.fillRect(M,t.y,i-M,t.h)}e.restore()}function Rt(e,t,o,n,s,{dash:d=null,flagTop:g=!0}={}){if(e.save(),e.strokeStyle=n,e.lineWidth=1,d&&e.setLineDash(d),e.shadowColor=n,e.shadowBlur=4,e.beginPath(),e.moveTo(Math.round(t)+.5,o.y),e.lineTo(Math.round(t)+.5,o.y+o.h),e.stroke(),e.restore(),s){e.save(),e.font=we,e.letterSpacing="1.2px";let v=e.measureText(s).width+8,y=H(t-v/2,o.x,o.x+o.w-v),M=g?o.y:o.y+o.h-11;e.fillStyle=n,e.fillRect(y,M,v,11),e.fillStyle=Xn,e.textAlign="center",e.textBaseline="middle",e.fillText(s,y+v/2,M+6),e.restore()}}function We(e,t=4){return H(Math.floor(e/26),1,t)}function Nt(e,t,o,{gap:n=8,least:s=1}={}){if(e<2||t<=0)return s;let d=t/(e-1);return Math.max(s,Math.ceil((o+n)/Math.max(d,.5)))}function Ne(e,t,o,n,s,d){let g=e.measureText(t).width;return g>d-s?!1:(e.fillText(t,H(o,s+g/2,d-g/2),n),!0)}function yt(e,t,o,n,s=[],{short:d=null}={}){let g=(c,S)=>{e.save(),e.font=we,e.letterSpacing=c;let f=e.measureText(String(S).toUpperCase()).width;return e.restore(),f},v=(c,S)=>g("1.4px",c)+S.reduce((f,l)=>f+g("1.2px",l.label)+16,0)+14,y=s.map(c=>c.short?{...c,label:c.short}:c),[M,i]=[[n,s],[n,y],[d??n,y],[d??n,[]]].find(([c,S])=>v(c,S)<=t.w)??[d??n,[]];Se(e,t.x+2,o,M),i.length&&ta(e,t.x+t.w,o+5,i,{align:"right"})}function Ue(e,t,o=4){if(!Number.isFinite(e)||!Number.isFinite(t)||e===t)return[e||0];let s=(t-e)/o,d=Math.pow(10,Math.floor(Math.log10(s))),g=s/d,v=(g<1.5?1:g<3?2:g<7?5:10)*d,y=[];for(let M=Math.ceil(e/v)*v;M<=t+1e-9;M+=v)y.push(+M.toFixed(6));return y}function Ke(e,t,o,n,{value:s,min:d=0,max:g=100,color:v=j[0],label:y="",unit:M="",bands:i=null,sub:c="",decimals:S=0,ticks:f=5}){let l=Math.PI*.75,p=Math.PI*2.25,a=s==null?0:H((s-d)/(g-d),0,1),u=l+(p-l)*a;if(e.save(),e.lineCap="butt",e.beginPath(),e.arc(t,o,n,l,p),e.strokeStyle="rgba(255,255,255,.07)",e.lineWidth=6,e.stroke(),i)for(let $ of i){let w=H(($.from-d)/(g-d),0,1),k=H(($.to-d)/(g-d),0,1);k<=w||(e.beginPath(),e.arc(t,o,n+6,l+(p-l)*w,l+(p-l)*k),e.strokeStyle=V($.color,.55),e.lineWidth=2.5,e.stroke())}e.strokeStyle="rgba(255,255,255,.14)",e.lineWidth=1;for(let $=0;$<=f;$++){let w=l+(p-l)*($/f),k=Math.cos(w),L=Math.sin(w);e.beginPath(),e.moveTo(t+k*(n-5),o+L*(n-5)),e.lineTo(t+k*(n-10),o+L*(n-10)),e.stroke()}if(s!=null&&a>.001){e.save(),e.shadowColor=v,e.shadowBlur=7,e.beginPath(),e.arc(t,o,n,l,u),e.strokeStyle=v,e.lineWidth=6,e.stroke(),e.restore();let $=Math.cos(u),w=Math.sin(u);e.beginPath(),e.arc(t+$*n,o+w*n,3.2,0,Math.PI*2),e.fillStyle=ye,e.shadowColor=v,e.shadowBlur=5,e.fill(),e.shadowBlur=0}e.textAlign="center",e.textBaseline="alphabetic",e.fillStyle=ye,e.font=`700 ${Math.round(n*.62)}px 'JetBrains Mono', monospace`;let m=s==null?"--":s.toFixed(S),h=o+n*.18,E=e.measureText(m).actualBoundingBoxDescent;if(e.fillText(m,t,h),M){e.font=ke,e.fillStyle=pe;let $=e.measureText(M).actualBoundingBoxAscent;e.fillText(M,t,Math.max(o+n*.46,h+E+$+3))}y&&(e.font=we,e.fillStyle=se,e.letterSpacing="1.4px",e.fillText(y.toUpperCase(),t,o+n+15)),c&&(e.font=we,e.fillStyle=v,e.letterSpacing="1.2px",Ce(e,c.toUpperCase(),t,o-n*.42)),e.restore()}function Uo(e,t,o,{color:n=j[0],fill:s=!0,width:d=1.8,min:g=null,max:v=null,glow:y=8}){let M=o.filter(l=>l!=null);if(M.length<2)return;let i=g??Math.min(...M),S=(v??Math.max(...M))-i||1,f=o.map((l,p)=>[t.x+p/(o.length-1)*t.w,t.y+t.h-((l??i)-i)/S*t.h]);if(s){e.save(),e.beginPath(),Re(e,f),e.lineTo(f.at(-1)[0],t.y+t.h),e.lineTo(f[0][0],t.y+t.h),e.closePath();let l=e.createLinearGradient(0,t.y,0,t.y+t.h);l.addColorStop(0,V(n,.34)),l.addColorStop(1,V(n,0)),e.fillStyle=l,e.fill(),e.restore()}return e.save(),y&&(e.shadowColor=n,e.shadowBlur=y/2),e.beginPath(),Re(e,f),e.strokeStyle=n,e.lineWidth=d,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore(),f}function Go(e,t,o,n,{dir:s,speed:d,gust:g,color:v=j[0]}){e.save(),e.strokeStyle="rgba(255,255,255,.09)",e.lineWidth=1,e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.stroke(),e.font=we,e.fillStyle=se,e.textAlign="center",e.textBaseline="middle";for(let[c,S]of[["N",-90],["E",0],["S",90],["W",180]]){let f=S*Math.PI/180;e.fillText(c,t+Math.cos(f)*(n+8),o+Math.sin(f)*(n+8))}for(let c=0;c<16;c++){let S=(c*22.5-90)*Math.PI/180,f=c%4===0;e.strokeStyle=f?"rgba(255,255,255,.20)":"rgba(255,255,255,.09)",e.beginPath(),e.moveTo(t+Math.cos(S)*n,o+Math.sin(S)*n),e.lineTo(t+Math.cos(S)*(n-(f?7:4)),o+Math.sin(S)*(n-(f?7:4))),e.stroke()}if(s!=null){let c=(s-90+180)*Math.PI/180,S=n-10;e.save(),e.translate(t,o),e.rotate(c),e.shadowColor=v,e.shadowBlur=6,e.fillStyle=v,e.beginPath(),e.moveTo(S,0),e.lineTo(S-9,-5.5),e.lineTo(S-6,0),e.lineTo(S-9,5.5),e.closePath(),e.fill(),e.strokeStyle=v,e.lineWidth=2,e.beginPath(),e.moveTo(-S*.55,0),e.lineTo(S-7,0),e.stroke(),e.restore()}e.textAlign="center",e.textBaseline="alphabetic",e.fillStyle=ye,e.font=`700 ${Math.round(n*.44)}px 'JetBrains Mono', monospace`;let y=d==null?"--":String(Math.round(d)),M=o+n*.06,i=e.measureText(y).actualBoundingBoxDescent;e.fillText(y,t,M),e.font=ke,e.fillStyle=pe,e.fillText("mph",t,Math.max(o+n*.3,M+i+e.measureText("mph").actualBoundingBoxAscent+3)),g!=null&&g>(d??0)+1&&(e.font=ke,e.fillStyle=N.serious,e.fillText(`G${Math.round(g)}`,t,o-n*.26)),e.restore()}function Ht(e,t,o,n,s,d){e.save(),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.fillStyle="#16212f",e.fill(),e.strokeStyle="rgba(127,178,240,.22)",e.lineWidth=1,e.stroke();let g=1-2*H(d,0,1),v=s<.5;e.save(),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.clip(),e.beginPath();let y=48;for(let i=0;i<=y;i++){let c=-1+2*i/y,S=g*Math.sqrt(Math.max(0,1-c*c)),f=t+(v?S:-S)*n;i===0?e.moveTo(f,o+c*n):e.lineTo(f,o+c*n)}for(let i=y;i>=0;i--){let c=-1+2*i/y;e.lineTo(t+(v?1:-1)*Math.sqrt(Math.max(0,1-c*c))*n,o+c*n)}e.closePath();let M=e.createRadialGradient(t-n*.25,o-n*.25,n*.1,t,o,n);M.addColorStop(0,"#f2f6ff"),M.addColorStop(1,"#b9c6da"),e.fillStyle=M,e.shadowColor="rgba(200,225,255,.7)",e.shadowBlur=n*.5,e.fill(),e.shadowBlur=0,e.globalCompositeOperation="multiply",e.fillStyle="rgba(150,165,190,.55)";for(let[i,c,S]of[[-.28,-.2,.26],[.1,-.34,.18],[.22,.1,.22],[-.15,.3,.16],[-.42,.12,.13]])e.beginPath(),e.arc(t+i*n,o+c*n,S*n,0,Math.PI*2),e.fill();e.restore(),e.restore()}function qo(e,t,o,n,{sunTrack:s=[],moonTrack:d=[],sun:g=null,moon:v=null,iss:y=null,night:M=0}){let i=(l,p)=>{let a=(1-H(p,0,90)/90)*n,u=(l-90)*Math.PI/180;return[t+Math.cos(u)*a,o+Math.sin(u)*a]};e.save();let c=e.createRadialGradient(t,o,0,t,o,n);c.addColorStop(0,M>.5?"rgba(6,12,30,.85)":"rgba(10,40,72,.55)"),c.addColorStop(1,M>.5?"rgba(2,4,12,.6)":"rgba(6,20,40,.4)"),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.fillStyle=c,e.fill(),e.strokeStyle="rgba(255,255,255,.10)",e.lineWidth=1;for(let l of[30,60])e.beginPath(),e.arc(t,o,(1-l/90)*n,0,Math.PI*2),e.stroke();e.strokeStyle="rgba(63,208,216,.28)",e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.stroke(),e.font=we,e.textAlign="center",e.textBaseline="middle";for(let[l,p]of[["N",0],["E",90],["S",180],["W",270]]){let[a,u]=i(p,0);e.strokeStyle="rgba(255,255,255,.07)",e.beginPath(),e.moveTo(t,o),e.lineTo(a,u),e.stroke();let[m,h]=i(p,-9);e.fillStyle=se,e.fillText(l,m,h)}let S=(l,p,a)=>{let u=[],m=()=>{u.length>1&&(e.save(),a&&e.setLineDash(a),Te(e,u,p,{width:1.5,glow:6}),e.restore()),u=[]};for(let h of l){if(h.alt<0){m();continue}u.push(i(h.az,h.alt))}m()};S(s,"#f2b45a",null),S(d,"#7fb2f0",[3,3]);let f=(l,p,a)=>{if(!l||l.alt<-2)return;let[u,m]=i(l.az,Math.max(0,l.alt));e.save(),e.shadowColor=p,e.shadowBlur=8,e.fillStyle=p,e.beginPath(),e.arc(u,m,a,0,Math.PI*2),e.fill(),e.restore(),l.alt<0&&(e.strokeStyle=V(p,.5),e.setLineDash([2,2]),e.beginPath(),e.arc(u,m,a+3,0,Math.PI*2),e.stroke(),e.setLineDash([]))};if(f(v,"#c9d8f5",5),f(g,"#efc865",6.5),y){let[l,p]=i(y.az,Math.max(0,y.alt));e.save(),e.strokeStyle="#8fdc6a",e.lineWidth=1.5,e.shadowColor="#8fdc6a",e.shadowBlur=5,e.beginPath(),e.arc(l,p,4,0,Math.PI*2),e.stroke(),e.beginPath(),e.moveTo(l-7,p),e.lineTo(l+7,p),e.stroke(),e.restore()}e.restore()}var ot=8,Vo=8,jo=16,Ko=15;function Yo(e){e.innerHTML=`
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
  `;let t=e.querySelector(".tl-canvas"),o=e.querySelector(".tl-when b"),n=e.querySelector(".tl-when span"),s=e.querySelector(".tl-delta"),d=e.querySelector(".tl-play"),g=!1,v=le(t,M,{inspect:!1});function y(l){let{lo:p,hi:a}=r.span,u=l-ot-Vo;return{lo:p,hi:a,plotW:u,xOf:m=>ot+(m-p)/(a-p||1)*u,tOf:m=>p+(m-ot)/u*(a-p||1)}}function M(l,p,a,u){let m=r.hours;if(!m?.length)return;let h=y(p),E=r.fmt,$={x:ot,y:jo,w:h.plotW,h:a-jo-Ko};l.save(),l.fillStyle="rgba(8,13,22,.4)";for(let B=0;B<r.days.length;B++){let Z=r.days[B],Q=r.days[B+1];if(!Z.sunset)continue;let J=H(h.xOf(Z.sunset),$.x,$.x+$.w),x=H(Q?.sunrise?h.xOf(Q.sunrise):$.x+$.w,$.x,$.x+$.w);x>J&&l.fillRect(J,$.y,x-J,$.h)}l.restore();let w=m.map(B=>B.temp).filter(B=>B!=null),k=Math.min(...w),L=Math.max(...w),R=B=>$.y+$.h*.92-(B-k)/(L-k||1)*$.h*.72,A=m.filter(B=>B.temp!=null).map(B=>[h.xOf(B.t),R(B.temp)]);l.save(),l.beginPath(),Re(l,A),l.lineTo(A.at(-1)[0],$.y+$.h),l.lineTo(A[0][0],$.y+$.h),l.closePath();let C=l.createLinearGradient(0,$.y,0,$.y+$.h);C.addColorStop(0,V(Le(L),.34)),C.addColorStop(1,V(Le(k),.03)),l.fillStyle=C,l.fill(),l.restore();let P=l.createLinearGradient(ot,0,ot+h.plotW,0);for(let B=0;B<=12;B++){let Z=m[Math.round(B/12*(m.length-1))];P.addColorStop(B/12,Le(Z?.temp))}l.save(),l.shadowColor=V(j[0],.8),l.shadowBlur=4,l.beginPath(),Re(l,A),l.strokeStyle=P,l.lineWidth=1.8,l.lineJoin="round",l.stroke(),l.restore();let T=Math.max(...m.map(B=>B.precip??0),.02);l.save();for(let B of m){let Z=B.precip??0;if(Z<.001)continue;let Q=h.xOf(B.t),J=H(Z/T,.08,1)*$.h*.3;l.fillStyle=V(j[4],.75),l.fillRect(Q-.7,$.y+$.h-J,1.6,J)}l.restore(),l.save(),l.font=we,l.letterSpacing="1.2px",l.textBaseline="top";let D=r.days.length>1?Math.abs(h.xOf(r.days[1].t)-h.xOf(r.days[0].t)):$.w,z=34,W=Math.max(1,Math.ceil(z/Math.max(1,D))),U=0;for(let B of r.days){let Z=h.xOf(B.t),Q=U++%W===0;Z<$.x||Z>$.x+$.w||(l.strokeStyle=Q?"rgba(255,255,255,.10)":"rgba(255,255,255,.05)",l.lineWidth=1,l.beginPath(),l.moveTo(Math.round(Z)+.5,$.y),l.lineTo(Math.round(Z)+.5,$.y+$.h),l.stroke(),!(!Q||Z+z>$.x+$.w)&&(l.fillStyle=se,l.textAlign="left",l.fillText(E.weekday(B.t).toUpperCase(),Z+3,a-Ko+3)))}l.restore();for(let B of r.alerts){let Z=Date.parse(B.effective||B.onset||0),Q=Date.parse(B.expires||B.ends||0);if(!Z||!Q)continue;let J=H(h.xOf(Z),$.x,$.x+$.w),x=H(h.xOf(Q),$.x,$.x+$.w);x<=J||(l.fillStyle=V(N.crit,.55),l.fillRect(J,$.y-4,x-J,3))}let O=Date.now(),G=h.xOf(O);if(G>=$.x&&G<=$.x+$.w&&(l.save(),l.strokeStyle=V(N.good,.85),l.lineWidth=1,l.setLineDash([2,3]),l.shadowColor=N.good,l.shadowBlur=4,l.beginPath(),l.moveTo(Math.round(G)+.5,$.y-4),l.lineTo(Math.round(G)+.5,$.y+$.h),l.stroke(),l.restore()),u&&!g&&u.x>$.x&&u.x<$.x+$.w){let B=h.tOf(u.x);l.save(),l.strokeStyle="rgba(255,255,255,.22)",l.lineWidth=1,l.beginPath(),l.moveTo(Math.round(u.x)+.5,$.y),l.lineTo(Math.round(u.x)+.5,$.y+$.h),l.stroke(),l.font=ke,l.fillStyle=pe,l.textAlign=u.x>p-70?"right":"left",l.textBaseline="top",l.fillText(`${E.weekday(B)} ${E.hm(B)}`,u.x+(u.x>p-70?-5:5),2),l.restore()}let X=h.xOf(r.cursor);l.save(),l.strokeStyle=j[1],l.lineWidth=1.5,l.shadowColor=j[1],l.shadowBlur=7,l.beginPath(),l.moveTo(Math.round(X)+.5,$.y-6),l.lineTo(Math.round(X)+.5,$.y+$.h+3),l.stroke(),l.fillStyle=j[1],l.beginPath(),l.moveTo(X,$.y-10),l.lineTo(X+5,$.y-16),l.lineTo(X-5,$.y-16),l.closePath(),l.fill(),l.restore()}let i=l=>{let p=t.getBoundingClientRect(),a=y(p.width);r.playing=!1,S(),r.scrubTo(a.tOf(H(l-p.left,ot,p.width-Vo)))};t.addEventListener("pointerdown",l=>{g=!0,t.setPointerCapture(l.pointerId),i(l.clientX)}),t.addEventListener("pointermove",l=>{g&&i(l.clientX)});let c=l=>{if(g){g=!1;try{t.releasePointerCapture(l.pointerId)}catch{}}};t.addEventListener("pointerup",c),t.addEventListener("pointercancel",c),t.style.cursor="ew-resize",e.addEventListener("click",l=>{let p=l.target.closest("button");if(!p)return;if(p.dataset.rate){r.playRate=+p.dataset.rate,e.querySelectorAll("[data-rate]").forEach(u=>u.classList.toggle("on",+u.dataset.rate===r.playRate));return}let a=p.dataset.act;a==="now"?r.toNow():a==="back"?(r.playing=!1,r.scrubTo(r.cursor-36e5)):a==="fwd"?(r.playing=!1,r.scrubTo(r.cursor+36e5)):a==="play"&&(r.playing=!r.playing,r.playing&&r.view!=="radar"&&(r.following=!1),r.playing&&r.cursor>=r.span.hi-6e4&&r.setCursor(Date.now()),r.emit("play",r.playing)),S()});function S(){d.textContent=r.playing?"\u275A\u275A":"\u25B6",d.classList.toggle("on",r.playing),e.querySelector(".tl-now").classList.toggle("on",r.atNow)}function f(){let l=r.fmt,p=r.cursor;o.textContent=l.hm12(p),n.textContent=`${l.weekday(p)} ${l.monthDay(p)}`;let a=p-Date.now(),u=Math.round(Math.abs(a)/6e4);if(u<3)s.textContent="NOW",s.className="tl-delta now";else{let m=Math.floor(u/60),h=u%60,E=m>=24?`${Math.floor(m/24)}d ${m%24}h`:m?`${m}h ${h}m`:`${h}m`;s.textContent=a>0?`+${E}`:`\u2212${E}`,s.className="tl-delta "+(a>0?"fwd":"back")}S()}return r.on("cursor",()=>{f(),v.render()}),r.on("data",()=>{f(),v.render()}),r.on("play",S),e.querySelector('[data-rate="1"]').classList.add("on"),f(),{render:()=>v.render(),tick(l){if(!r.playing||r.view==="radar")return;let p=r.cursor+l*1e3*3600*r.playRate;p>=r.span.hi?(r.setCursor(r.span.hi),r.playing=!1,r.emit("play",!1),S()):r.setCursor(p)}}}function Ft(e,t,o,n,s){let{hours:d,days:g,span:v,cursor:y,now:M,tf:i,panels:c=["temp","pop"],showAxis:S=!0}=s;if(!d?.length)return;let f=4,l=30,p=14,a=S?30:4,u=t-f-l;if(u<30)return;let m=d.filter(T=>T.t>=v.lo-36e5&&T.t<=v.hi+36e5);if(m.length<2)return;let h=T=>f+(T-v.lo)/(v.hi-v.lo)*u,E=T=>v.lo+(T-f)/u*(v.hi-v.lo),$={temp:1,pop:.42,wind:.42,cloud:.3,pressure:.42,uv:.36,cape:.36},w=c.reduce((T,D)=>T+($[D]||.4),0),k=c.length>2?16:9,L=o-p-a-(c.length-1)*k,R=p,A={};for(let T of c){let D=L*($[T]||.4)/w;A[T]={x:f,y:R,w:u,h:D},R+=D+k}let C={x:f,y:p,w:u,h:o-p-a};if(Wo(e,C,g||[],h),g?.length){e.save(),e.strokeStyle="rgba(255,255,255,.07)",e.lineWidth=1,e.font=we,e.letterSpacing="1.2px",e.textBaseline="top";for(let T of g){let D=h(T.t);D<f-1||D>f+u||(e.beginPath(),e.moveTo(Math.round(D)+.5,p),e.lineTo(Math.round(D)+.5,p+C.h),e.stroke(),S&&(e.fillStyle=se,e.textAlign="left",e.fillText(i.weekday(T.t).toUpperCase(),D+3,o-a+17)))}e.restore()}let P=[];if(A.temp){let T=A.temp,D=m.map(J=>J.temp).filter(J=>J!=null),z=m.map(J=>J.feels).filter(J=>J!=null),W=D.concat(z),U=Math.min(...W)-2,O=Math.max(...W)+2,G=J=>T.y+T.h-(J-U)/(O-U)*T.h;if(Ie(e,T,Ue(U,O,We(T.h,3)).map(J=>({v:J,y:G(J)})),J=>`${Math.round(J)}\xB0`),z.length>1){e.save(),e.setLineDash([4,3]);let J=m.filter(x=>x.feels!=null).map(x=>[h(x.t),G(x.feels)]);Te(e,J,V(j[1],.75),{width:1.5,glow:6}),e.restore()}let X=m.filter(J=>J.temp!=null).map(J=>[h(J.t),G(J.temp)]);e.save(),e.beginPath(),Re(e,X),e.lineTo(X.at(-1)[0],T.y+T.h),e.lineTo(X[0][0],T.y+T.h),e.closePath();let B=e.createLinearGradient(0,T.y,0,T.y+T.h);B.addColorStop(0,V(Le(O),.3)),B.addColorStop(1,V(Le(U),.02)),e.fillStyle=B,e.fill(),e.restore();let Z=e.createLinearGradient(f,0,f+u,0);for(let J=0;J<=8;J++){let x=m[Math.round(J/8*(m.length-1))];Z.addColorStop(J/8,Le(x?.temp))}e.save(),e.shadowColor=V(j[0],.9),e.shadowBlur=6,e.beginPath(),Re(e,X),e.strokeStyle=Z,e.lineWidth=2.2,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore(),e.save(),e.font=ke,e.textAlign="center",e.textBaseline="bottom";let Q=e.measureText("100\xB0").width+6;for(let J of g||[]){let x=m.filter(de=>i.isoDate(de.t)===i.isoDate(J.t)&&de.temp!=null);if(x.length<3)continue;let fe=x.reduce((de,ve)=>ve.temp>de.temp?ve:de),Ae=x.reduce((de,ve)=>ve.temp<de.temp?ve:de);for(let[de,ve,b]of[[fe,-6,"bottom"],[Ae,13,"top"]]){let I=h(de.t),q=e.measureText(`${Math.round(de.temp)}\xB0`).width;if(I-q/2<f+4||I+q/2>f+u-Q)continue;let F=G(de.temp)+ve,_=b==="top"?F+9>T.y+T.h:F-9<T.y;e.textBaseline=_?b==="top"?"bottom":"top":b,e.fillStyle=Le(de.temp),Ce(e,`${Math.round(de.temp)}\xB0`,I,_?G(de.temp)-ve:F)}}e.restore(),yt(e,T,T.y-11,"temperature \xB0F",[{label:"actual",color:j[0]},{label:"feels like",short:"feels",color:j[1],dash:!0}],{short:"temp \xB0F"}),P.push({key:"temp",box:T,yOf:G})}if(A.pop){let T=A.pop,D=G=>T.y+T.h-H(G,0,100)/100*T.h;Ie(e,T,[50,100].map(G=>({v:G,y:D(G)})),G=>`${G}%`);let z=m.map(G=>[h(G.t),D(G.pop??0)]);e.save(),e.beginPath(),Re(e,z),e.lineTo(z.at(-1)[0],T.y+T.h),e.lineTo(z[0][0],T.y+T.h),e.closePath();let W=e.createLinearGradient(0,T.y,0,T.y+T.h);W.addColorStop(0,V(j[4],.55)),W.addColorStop(1,V(j[4],.04)),e.fillStyle=W,e.fill(),e.restore(),Te(e,z,j[4],{width:1.6,glow:7}),e.save(),e.font=ke,e.textAlign="center",e.textBaseline="bottom",e.fillStyle=j[0];let U=-999,O=e.measureText("100%").width+6;for(let G=1;G<m.length-1;G++){let X=m[G];if((X.precip??0)<.02||(X.precip??0)<=(m[G-1].precip??0)||(X.precip??0)<(m[G+1].precip??0))continue;let B=h(X.t),Z=e.measureText(`${X.precip.toFixed(2)}"`).width;B-U<46||B-Z/2<f+4||B+Z/2>f+u-O||(e.fillText(`${X.precip.toFixed(2)}"`,B,D(X.pop??0)-4),U=B)}e.restore(),Se(e,T.x+2,T.y-11,"precip probability"),P.push({key:"pop",box:T,yOf:D})}if(A.wind){let T=A.wind,D=Math.max(...m.map(O=>O.gust??O.wind??0),10)*1.12,z=O=>T.y+T.h-H(O,0,D)/D*T.h;Ie(e,T,Ue(0,D,We(T.h,2)).map(O=>({v:O,y:z(O)})),O=>String(Math.round(O)));let W=m.map(O=>[h(O.t),z(O.gust??O.wind??0)]);e.save(),e.beginPath(),Re(e,W),e.lineTo(W.at(-1)[0],T.y+T.h),e.lineTo(W[0][0],T.y+T.h),e.closePath(),e.fillStyle=V(N.serious,.16),e.fill(),e.restore(),Te(e,W,V(N.serious,.85),{width:1.2,glow:5}),Te(e,m.map(O=>[h(O.t),z(O.wind??0)]),j[3],{width:1.8,glow:8}),e.save(),e.strokeStyle=V(j[3],.55),e.lineWidth=1;let U=Math.max(1,Math.round(m.length/(u/26)));for(let O=0;O<m.length;O+=U){let G=m[O];if(G.windDir==null)continue;let X=h(G.t),B=T.y+T.h-5,Z=(G.windDir-90+180)*Math.PI/180;e.save(),e.translate(X,B),e.rotate(Z),e.beginPath(),e.moveTo(-4,0),e.lineTo(4,0),e.moveTo(4,0),e.lineTo(1.5,-2),e.moveTo(4,0),e.lineTo(1.5,2),e.stroke(),e.restore()}e.restore(),yt(e,T,T.y-11,"wind mph",[{label:"sustained",short:"wind",color:j[3]},{label:"gusts",color:N.serious}],{short:"wind"}),P.push({key:"wind",box:T,yOf:z})}if(A.cloud){let T=A.cloud,D=m.length,z=Math.max(1,u/D),W=[["cloudHigh",V(j[4],.55)],["cloudMid",V(j[0],.5)],["cloudLow",V(ye,.45)]];m.forEach((U,O)=>{let G=f+O*u/D,X=T.y,B=T.h/3;W.forEach(([Z,Q],J)=>{let x=H((U[Z]??0)/100,0,1);e.fillStyle=Q,e.fillRect(G,X+(B-2)*(1-x),Math.max(1,z-.5),(B-2)*x),X+=B})}),e.save(),e.font=we,e.textAlign="right",e.textBaseline="middle",["HIGH","MID","LOW"].forEach((U,O)=>{let G=T.y+T.h/3*(O+.5);e.fillStyle="rgba(22,33,47,.75)",e.fillRect(T.x+T.w-30,G-5,30,10),e.fillStyle=se,Ce(e,U,T.x+T.w-2,G)}),e.restore(),Se(e,T.x+2,T.y-11,"cloud decks %"),P.push({key:"cloud",box:T})}if(A.pressure){let T=A.pressure,D=m.map(O=>O.pressure).filter(O=>O!=null),z=Math.min(...D)-1,W=Math.max(...D)+1,U=O=>T.y+T.h-(O-z)/(W-z)*T.h;Ie(e,T,Ue(z,W,We(T.h,2)).map(O=>({v:O,y:U(O)})),O=>(O*.02953).toFixed(2)),Te(e,m.filter(O=>O.pressure!=null).map(O=>[h(O.t),U(O.pressure)]),j[3],{width:1.8,glow:8}),Se(e,T.x+2,T.y-11,"pressure inHg"),P.push({key:"pressure",box:T,yOf:U})}if(A.uv){let T=A.uv,D=U=>T.y+T.h-H(U,0,12)/12*T.h;Ie(e,T,[3,6,8,11].map(U=>({v:U,y:D(U)})),String);let z=m.length,W=Math.max(1,u/z-1);m.forEach((U,O)=>{let G=U.uv??0;if(G<=.05)return;let X=f+O*u/z,B=G<3?N.good:G<6?N.warn:G<8?N.serious:G<11?N.crit:j[3];je(e,X,D(G),W,T.y+T.h,V(B,.8))}),Se(e,T.x+2,T.y-11,"uv index"),P.push({key:"uv",box:T,yOf:D})}if(A.cape){let T=A.cape,D=Math.max(...m.map(U=>U.cape??0),500)*1.1,z=U=>T.y+T.h-H(U,0,D)/D*T.h;Ie(e,T,Ue(0,D,We(T.h,2)).map(U=>({v:U,y:z(U)})),U=>String(Math.round(U)));let W=m.map(U=>[h(U.t),z(U.cape??0)]);e.save(),e.beginPath(),Re(e,W),e.lineTo(W.at(-1)[0],T.y+T.h),e.lineTo(W[0][0],T.y+T.h),e.closePath(),e.fillStyle=V(N.crit,.18),e.fill(),e.restore(),Te(e,W,N.crit,{width:1.6,glow:7}),Se(e,T.x+2,T.y-11,"CAPE J/kg"),P.push({key:"cape",box:T,yOf:z})}if(S){e.save(),e.font=ke,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let T=(v.hi-v.lo)/36e5,D=T>200?24:T>96?12:T>40?6:T>16?3:1,z=e.measureText("00:00").width+8,W=u/Math.max(T,1),U=[1,3,6,12,24,48].filter(O=>O>=D).find(O=>O*W>=z)??48;for(let O of m){let G=i.hourOfDay(O.t);if(Math.abs(G-Math.round(G))>.01||Math.round(G)%U!==0)continue;let X=h(O.t);X<f+10||X>f+u-10||e.fillText(i.hm(O.t),X,o-a+4)}e.restore()}if(M!=null&&M>=v.lo&&M<=v.hi&&Rt(e,h(M),C,V(N.good,.9),"NOW",{dash:[3,3]}),y!=null&&Math.abs(y-(M??y))>9e4&&y>=v.lo&&y<=v.hi&&Rt(e,h(y),C,j[1],null),n&&n.x>f&&n.x<f+u){let T=E(n.x),D=xo(m,T);if(D){let z=h(D.t);e.save(),e.strokeStyle="rgba(255,255,255,.35)",e.setLineDash([2,3]),e.lineWidth=1,e.beginPath(),e.moveTo(Math.round(z)+.5,p),e.lineTo(Math.round(z)+.5,p+C.h),e.stroke(),e.restore();for(let U of P){if(!U.yOf)continue;let O=U.key==="temp"?D.temp:U.key==="pop"?D.pop??0:U.key==="wind"?D.wind:U.key==="pressure"?D.pressure:U.key==="uv"?D.uv:U.key==="cape"?D.cape:null;O!=null&&(e.save(),e.fillStyle=ye,e.shadowColor=j[0],e.shadowBlur=5,e.beginPath(),e.arc(z,U.yOf(O),3.5,0,Math.PI*2),e.fill(),e.restore())}let W=[`${i.weekday(D.t)} ${i.hm(D.t)}|`];A.temp&&(W.push(`TEMP|${Y.temp(D.temp)}`),W.push(`FEELS|${Y.temp(D.feels)}`)),A.pop&&(W.push(`RAIN CHANCE|${Y.pct(D.pop)}`),(D.precip??0)>.001&&W.push(`AMOUNT|${Y.inches(D.precip)}"`)),A.wind&&W.push(`WIND|${Y.wind(D.wind)} ${me(D.windDir)}`),A.pressure&&W.push(`PRESSURE|${Y.pressure(D.pressure)}`),A.uv&&W.push(`UV|${D.uv?.toFixed(1)??"--"}`),A.cape&&W.push(`CAPE|${Math.round(D.cape??0)}`),W.push(`SKY|${Xe(Math.round(D.code??0)).label}`),tt(e,z,n.y,W,t,o,"#3fd0d8",{pin:n.coarse})}}return{xOf:h,tOf:E,boxes:A}}function xo(e,t){let o=null,n=1/0;for(let s of e){let d=Math.abs(s.t-t);d<n&&(n=d,o=s)}return o}function Zo(e,t,o,n,{rows:s,tf:d,now:g}){if(!s?.length)return;let v=4,y=34,M=16,i=20,c={x:v,y:M,w:t-v-y,h:o-M-i};if(c.w<30||c.h<20)return;let S=Math.min(...s.map(w=>w.min)),f=Math.max(...s.map(w=>w.max)),l=S-2,p=f+2,a=w=>c.x+(w-s[0].t)/(s.at(-1).t-s[0].t)*c.w,u=w=>c.y+c.h-(w-l)/(p-l)*c.h;Ie(e,c,Ue(l,p,We(c.h,4)).map(w=>({v:w,y:u(w)})),w=>`${Math.round(w)}\xB0`),e.save(),e.beginPath(),s.forEach((w,k)=>k?e.lineTo(a(w.t),u(w.max)):e.moveTo(a(w.t),u(w.max)));for(let w=s.length-1;w>=0;w--)e.lineTo(a(s[w].t),u(s[w].min));e.closePath();let m=e.createLinearGradient(c.x,0,c.x+c.w,0);m.addColorStop(0,V(j[0],.3)),m.addColorStop(1,V(j[0],.1)),e.fillStyle=m,e.fill(),e.strokeStyle=V(j[0],.35),e.lineWidth=1,e.stroke(),e.restore(),Te(e,s.map(w=>[a(w.t),u(w.mean)]),j[0],{width:2,glow:10}),e.save(),e.strokeStyle=co,e.font=ke,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let h="",E=e.measureText("WED").width+8,$=-1e9;for(let w of s){let k=d.isoDate(w.t);if(k===h)continue;h=k;let L=a(w.t);e.beginPath(),e.moveTo(L+.5,c.y),e.lineTo(L+.5,c.y+c.h),e.stroke(),!(L<c.x+12||L>c.x+c.w-12||L-$<E)&&(e.fillText(d.weekday(w.t).toUpperCase(),L,o-i+5),$=L)}if(e.restore(),g>=s[0].t&&g<=s.at(-1).t&&Rt(e,a(g),c,V(N.good,.9),"NOW",{dash:[3,3]}),yt(e,c,3,"model agreement \xB0F",[{label:"ensemble mean",short:"mean",color:j[0]},{label:"model range",short:"range",color:V(j[0],.35)}],{short:"model spread \xB0F"}),n&&n.x>c.x&&n.x<c.x+c.w){let w=s[0].t+(n.x-c.x)/c.w*(s.at(-1).t-s[0].t),k=xo(s,w);if(k){let L=a(k.t);e.save(),e.strokeStyle="rgba(255,255,255,.3)",e.setLineDash([2,3]),e.beginPath(),e.moveTo(L+.5,c.y),e.lineTo(L+.5,c.y+c.h),e.stroke(),e.restore();let R=k.spread<2?"HIGH":k.spread<5?"MODERATE":k.spread<9?"LOW":"VERY LOW";tt(e,L,n.y,[`${d.weekday(k.t)} ${d.hm(k.t)}|`,`MEAN|${Y.tempP(k.mean)}`,`RANGE|${Y.temp(k.min)}\u2013${Y.temp(k.max)}`,`SPREAD|${k.spread.toFixed(1)}\xB0`,`CONFIDENCE|${R}`,k.precipAgree!=null?`MODELS WET|${Math.round(k.precipAgree*100)}%`:null].filter(Boolean),t,o,"#3fd0d8",{pin:n.coarse})}}}function Jo(e,t,o,n,{days:s,climate:d,tf:g,doyOf:v}){if(!s?.length||!d?.doy?.length)return;let y=4,M=34,i=16,c=20,S={x:y,y:i,w:t-y-M,h:o-i-c};if(S.w<40||S.h<30)return;let f=s.map(k=>{let L=d.doy[v(k.t)];return L?{...k,c:L}:null}).filter(Boolean);if(!f.length)return;let l=f.flatMap(k=>[k.c.recordHigh,k.c.recordLow,k.tmax,k.tmin]).filter(k=>k!=null),p=Math.min(...l)-3,a=Math.max(...l)+3,u=f.length,m=S.w/u,h=k=>S.x+m*(k+.5),E=k=>S.y+S.h-(k-p)/(a-p)*S.h;Ie(e,S,Ue(p,a,We(S.h,4)).map(k=>({v:k,y:E(k)})),k=>`${Math.round(k)}\xB0`),e.save(),e.beginPath(),f.forEach((k,L)=>L?e.lineTo(h(L),E(k.c.recordHigh)):e.moveTo(h(L),E(k.c.recordHigh)));for(let k=u-1;k>=0;k--)e.lineTo(h(k),E(f[k].c.recordLow));e.closePath(),e.fillStyle="rgba(255,255,255,.045)",e.fill(),e.restore(),e.save(),e.beginPath(),f.forEach((k,L)=>L?e.lineTo(h(L),E(k.c.normalHigh)):e.moveTo(h(L),E(k.c.normalHigh)));for(let k=u-1;k>=0;k--)e.lineTo(h(k),E(f[k].c.normalLow));e.closePath(),e.fillStyle="rgba(141,154,171,.20)",e.fill(),e.strokeStyle="rgba(141,154,171,.45)",e.setLineDash([3,3]),e.lineWidth=1,e.stroke(),e.restore();let $=Math.min(15,m*.42);f.forEach((k,L)=>{if(k.tmax==null||k.tmin==null)return;let R=(k.tmax-k.c.normalHigh+(k.tmin-(k.c.normalLow??k.c.normalHigh)))/2,A=H(Math.abs(R)/15,0,1),C=R>=0?Be("#8d9aab","#f2b45a",A):Be("#8d9aab","#7fb2f0",A),P=h(L)-$/2,T=E(k.tmax),D=E(k.tmin);e.save(),e.shadowColor=C,e.shadowBlur=5,e.fillStyle=C;let z=Math.min(4,$/2);e.beginPath(),e.moveTo(P,D-z),e.lineTo(P,T+z),e.quadraticCurveTo(P,T,P+z,T),e.lineTo(P+$-z,T),e.quadraticCurveTo(P+$,T,P+$,T+z),e.lineTo(P+$,D-z),e.quadraticCurveTo(P+$,D,P+$-z,D),e.lineTo(P+z,D),e.quadraticCurveTo(P,D,P,D-z),e.closePath(),e.fill(),e.restore(),k.tmax>=k.c.recordHigh&&(e.save(),e.fillStyle=N.crit,e.font=ke,e.textAlign="center",e.textBaseline="bottom",Ce(e,"REC",h(L),E(k.tmax)-4),e.restore())}),e.save(),e.font=ke,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let w=Nt(u,S.w,e.measureText("WED").width,{least:u>12?2:1});if(f.forEach((k,L)=>{L%w||Ne(e,g.weekday(k.t).toUpperCase(),h(L),o-c+5,0,t)}),e.restore(),yt(e,S,3,"forecast vs climate record \xB0F",[{label:"forecast",color:"#f2b45a"},{label:"normal",color:"rgba(141,154,171,.7)",dash:!0},{label:"record range",short:"record",color:"rgba(255,255,255,.2)"}],{short:"climate record \xB0F"}),n&&n.x>S.x&&n.x<S.x+S.w){let k=H(Math.floor((n.x-S.x)/m),0,u-1),L=f[k],R=L.tmax-L.c.normalHigh;tt(e,h(k),n.y,[`${g.weekday(L.t)} ${g.monthDay(L.t)}|`,`FORECAST|${Y.temp(L.tmin)} \u2013 ${Y.temp(L.tmax)}`,`NORMAL|${Y.temp(L.c.normalLow)} \u2013 ${Y.temp(L.c.normalHigh)}`,`HIGH vs NORMAL|${Y.signed(R)}\xB0`,`RECORD HIGH|${Y.temp(L.c.recordHigh)} (${L.c.recordHighYear})`,`RECORD LOW|${Y.temp(L.c.recordLow)} (${L.c.recordLowYear})`],t,o,R>=0?"#f2b45a":"#7fb2f0",{pin:n.coarse})}}function Qo(e,t,o,n,{rows:s,tf:d,now:g}){if(!s?.length)return;let v=4,y=22,M=14,i=18,c={x:v,y:M,w:t-v-y,h:o-M-i};if(c.w<30)return;let S=s.length,f=Math.max(2,c.w/S-2),l=Math.max(5.6,Math.ceil(Math.max(...s.map(h=>h.kp))+.8)),p=h=>c.y+c.h-H(h,0,l)/l*c.h;Ie(e,c,[3,5,7].filter(h=>h<=l).map(h=>({v:h,y:p(h)})),String),e.save(),e.strokeStyle=V(N.serious,.5),e.setLineDash([4,3]),e.lineWidth=1,e.beginPath(),e.moveTo(c.x,p(5)),e.lineTo(c.x+c.w,p(5)),e.stroke(),e.setLineDash([]),e.font=we,e.fillStyle=V(N.serious,.8),e.textAlign="left",e.textBaseline="bottom",Ce(e,"STORM",c.x+3,p(5)-2),e.restore(),s.forEach((h,E)=>{let $=h.kp<3?j[0]:h.kp<5?N.good:h.kp<6?N.warn:h.kp<7?N.serious:N.crit,w=c.x+E*c.w/S;je(e,w,p(Math.min(h.kp,l)),f,c.y+c.h,V($,h.observed==="observed"?.9:.55))}),e.save(),e.font=ke,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let a="",u=e.measureText("WED").width+8,m=-1e9;if(s.forEach((h,E)=>{let $=d.isoDate(h.t);if($===a)return;a=$;let w=c.x+E*c.w/S+f/2;w<c.x+10||w>c.x+c.w-10||w-m<u||(e.fillText(d.weekday(h.t).toUpperCase(),w,o-i+4),m=w)}),e.restore(),Se(e,c.x+2,2,"planetary K index"),n&&n.x>c.x&&n.x<c.x+c.w){let h=H(Math.floor((n.x-c.x)/c.w*S),0,S-1),E=s[h];tt(e,c.x+h*c.w/S+f/2,n.y,[`${d.weekday(E.t)} ${d.hm(E.t)}|`,`Kp|${E.kp.toFixed(2)}`,`STATUS|${(E.observed||"predicted").toUpperCase()}`],t,o,j[3],{pin:n.coarse})}}var zt=(e,t,o)=>o>=6&&o<22;function ie(e,t,o,n,s){return e==null?.5:e>=o&&e<=n?1:e<o?t>=o?1:H((e-t)/(o-t),0,1):s<=n?1:H((s-e)/(s-n),0,1)}var _t={walk:{label:"WALK",icon:"\u{1F6B6}",color:"#3fd0d8",hours:zt,score(e){return[["temperature",ie(e.feels??e.temp,30,50,75,95),.3],["dry",1-H((e.pop??0)/100,0,1)*.9,.24],["wind",ie(e.wind,-1,0,12,30),.12],["humidity",ie(e.dew,-20,20,60,76),.1],["UV",ie(e.uv,-1,0,5,11),.07],["air quality",ie(e.air?.aqi,-1,0,50,160),.07],["daylight",e.isDay?1:.5,.1]]}},bike:{label:"BIKE",icon:"\u{1F6B2}",color:"#8fdc6a",hours:zt,score(e){return[["temperature",ie(e.feels??e.temp,25,58,78,98),.26],["dry",1-H((e.pop??0)/100,0,1),.22],["wind",ie(e.gust??e.wind,-1,0,8,24),.24],["visibility",ie(e.vis,0,8e3,1/0,1/0),.08],["UV",ie(e.uv,-1,0,5,11),.05],["air quality",ie(e.air?.aqi,-1,0,50,150),.05],["daylight",e.isDay?1:.35,.1]]}},grill:{label:"GRILL",icon:"\u{1F525}",color:"#f2b45a",hours:zt,score(e){return[["dry",1-H((e.pop??0)/100,0,1)*1,.34],["temperature",ie(e.temp,35,62,88,104),.24],["wind",ie(e.wind,-1,0,10,22),.24],["daylight or dusk",e.isDay?1:.55,.1],["humidity",ie(e.dew,-20,20,64,78),.08]]}},stargaze:{label:"STARGAZE",icon:"\u2726",color:"#b39dfa",hours:e=>!e.isDay,score(e,t){return[["darkness",e.isDay?0:1,.26],["clear sky",1-H((e.cloud??0)/100,0,1),.32],["no moon",1-H(t?.moonFraction??.5,0,1)*(t?.moonUp?1:.15),.18],["transparency",ie(e.vis,0,2e4,1/0,1/0),.1],["low humidity",ie(e.rh,-1,0,65,100),.08],["calm",ie(e.wind,-1,0,8,28),.06]]}},photo:{label:"PHOTO",icon:"\u25CE",color:"#f07aa6",hours:(e,t)=>!!e.isDay||t?.sunAltDeg!=null&&t.sunAltDeg>-8,score(e,t){let o=t?.sunAltDeg==null?.4:Math.exp(-Math.pow((t.sunAltDeg-3)/7,2)),n=1-Math.abs((e.cloud??50)/100-.45)*1.6;return[["golden light",H(o,0,1),.4],["sky texture",H(n,0,1),.26],["dry",1-H((e.pop??0)/100,0,1)*.7,.18],["clarity",ie(e.vis,0,15e3,1/0,1/0),.16]]}},swim:{label:"SWIM",icon:"\u{1F3CA}",color:"#7fb2f0",hours:(e,t,o)=>!!e.isDay&&o>=7&&o<20,score(e){let t=[95,96,99].includes(Number(e.code));return[["temperature",ie(e.feels??e.temp,65,80,95,105),.34],["dry",1-H((e.pop??0)/100,0,1),.18],["no thunder",t?0:1,.1],["sunshine",ie(e.cloud,-1,0,40,100),.12],["wind",ie(e.wind,-1,0,10,25),.12],["UV",ie(e.uv,-1,2,7,11),.08],["air quality",ie(e.air?.aqi,-1,0,50,150),.06]]}},openWindows:{label:"OPEN UP",icon:"\u{1FA9F}",color:"#5cd6bc",hours:zt,score(e){return[["comfortable air",ie(e.temp,40,62,76,90),.34],["dry air",ie(e.dew,-20,25,58,70),.24],["clean air",ie(e.air?.aqi,-1,0,50,130),.22],["no rain",1-H((e.pop??0)/100,0,1),.12],["calm",ie(e.wind,-1,0,14,34),.08]]}}},Bt=Object.keys(_t),Wt=e=>_t[e];function Ut(e,t,o){let n=_t[e];if(!n||!t)return null;let s=n.score(t,o),d=0;for(let[,y,M]of s)d+=H(y,0,1)*M;let g=null,v=0;for(let[y,M,i]of s){let c=(1-H(M,0,1))*i;c>v&&(v=c,g=y)}return{score:Math.round(H(d,0,1)*100),limiter:v>.06?g:null,parts:s.map(([y,M,i])=>({name:y,value:H(M,0,1),weight:i}))}}function oa(e,t){let o=e.fmt?.hourOfDay?e.fmt.hourOfDay(t):NaN;return Number.isFinite(o)?o:new Date(t).getHours()}function Xo(e,t,o=36){let n=_t[e];if(!n)return[];let s=Date.now(),d=s+o*36e5;return t.hours.filter(g=>g.t>=s-18e5&&g.t<=d).map(g=>{let v=aa(t,g.t),y=n.hours?!!n.hours(g,v,oa(t,g.t)):!0;return{t:g.t,eligible:y,...Ut(e,{...g,air:na(t,g.t)},v)}})}function en(e,t,{hours:o=36,at:n=90}={}){let d=Xo(e,t,o).filter(g=>g.eligible);return{great:d.filter(g=>g.score>=n).length,eligible:d.length}}function Gt(e,t,{hours:o=36,limit:n=3,minScore:s=55}={}){let d=Xo(e,t,o);if(!d.length)return[];for(let M of d)M.eligible||(M.score=-1/0);let g=12,v=new Array(d.length).fill(!1),y=[];for(let M=0;M<n;M++){let i=-1;for(let a=0;a<d.length;a++)v[a]||d[a].score<s||(i<0||d[a].score>d[i].score)&&(i=a);if(i<0)break;let c=d[i].score,S=Math.max(s,c-g),f=i,l=i;for(;f-1>=0&&!v[f-1]&&d[f-1].score>=S;)f--;for(;l+1<d.length&&!v[l+1]&&d[l+1].score>=S;)l++;for(let a=f;a<=l;a++)v[a]=!0;let p=0;for(let a=f;a<=l;a++)p+=d[a].score;y.push({start:d[f].t,end:d[l].t+36e5,peakAt:d[i].t,peak:c,avg:Math.round(p/(l-f+1)),hours:l-f+1,limiter:d[i].limiter,parts:d[i].parts})}return y.sort((M,i)=>i.peak-M.peak||M.start-i.start)}function na(e,t){if(!e.air?.length)return null;let o=null,n=1/0;for(let s of e.air){let d=Math.abs(s.t-t);d<n&&(n=d,o=s)}return n<36e5*2?o:null}function aa(e,t){let o=e.frame(t);return o?{sunAltDeg:o.sun.altDeg,moonFraction:o.moon.fraction,moonUp:o.moon.altDeg>0}:{}}function wt(e){let t=Date.now(),o=t+6*36e5,n=(e.min15?.length?e.min15:e.hours).filter(y=>y.t>=t-9e5&&y.t<=o);if(n.length<2)return null;let s=.002,d=(n[0].precip??0)>=s,g=null;for(let y of n)if((y.precip??0)>=s!==d){g=y;break}let v=n.reduce((y,M)=>(M.precip??0)>(y.precip??0)?M:y,n[0]);return{raining:d,changeAt:g?.t??null,minutes:g?Math.round((g.t-t)/6e4):null,peak:v.precip??0,peakAt:v.t,resolution:e.min15?.length?15:60,series:n.map(y=>({t:y.t,p:y.precip??0}))}}function tn(e,t){return e?e.raining?e.minutes!=null?`Rain now \u2014 easing in about ${e.minutes} min`:"Rain now \u2014 no let-up in the next 6 hours":e.minutes!=null&&e.minutes<=240?`${e.peak>.08?"Heavy rain":e.peak>.02?"Rain":"Light rain"} starting in ${e.minutes} min (${t.hm(e.changeAt)})`:null:null}var qt=e=>e<0?0:e>1?1:e,ge=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function on(e,t,o={},n={}){if(!t)return null;let s=ge(t.temperature_2m),d=String(o.temperature_2m||"").includes("F"),g=ge(t.wind_speed_10m),v=/mp\/?h|mph/i.test(String(o.wind_speed_10m||"")),y=ge(t.precipitation),M=/inch/i.test(String(o.precipitation||""));return{name:e,tempRaw:s,tempC:s===null?null:d?(s-32)/1.8:s,windKmh:g===null?null:v?g*1.609344:g,precipMm:y===null?null:M?y*25.4:y,cloudPct:ge(t.cloud_cover),night:t.is_day===0,...n}}function bt(e){let t=ge(e?.tempC);if(t===null)return null;let o=qt(1-Math.abs(t-21)/18),n=qt(1-(ge(e?.precipMm)??0)/2),s=qt(1-(ge(e?.cloudPct)??0)/100*.6),d=qt(1-Math.max(0,(ge(e?.windKmh)??0)-20)/40);return Math.round(100*(.4*o+.3*n+.2*s+.1*d))}function Vt(e){let t=ge(e?.precipMm)??0,o=ge(e?.cloudPct),n=ge(e?.windKmh)??0;return t>=.5?"raining":t>0?"drizzling":n>=20+40/2?"blowing hard":o===null?null:o<=15?"clear":o<=45?"some cloud":o<=80?"cloudy":"overcast"}function sa(e,t){let o=bt(e),n=bt(t);if(n===null)return null;let s=ge(t.tempC)!==null&&ge(e?.tempC)!==null?Math.round(t.tempC-e.tempC):null,d=ge(t.tempRaw)!==null&&ge(e?.tempRaw)!==null?Math.round(t.tempRaw-e.tempRaw):null;return{name:t.name,score:n,deltaScore:o===null?null:n-o,deltaC:s,deltaShown:d===null?s:d,better:o!==null&&n>o,headline:Vt(t),tempC:ge(t.tempC),localHour:ge(t.localHour),night:t.night===!0}}function nn(e,t){let o=(Array.isArray(t)?t:[]).map(n=>sa(e,n)).filter(Boolean);return o.sort((n,s)=>s.score-n.score||(s.deltaC??0)-(n.deltaC??0)||String(n.name).localeCompare(String(s.name))),o}function uo(e){if(!e)return"";let t=[],o=e.deltaShown??e.deltaC;return o!==null&&o!==0?t.push(`${Math.abs(o)}\xB0 ${o>0?"warmer":"colder"}`):o===0&&t.push("same temperature"),e.headline&&t.push(e.headline),e.night&&e.localHour!==null&&t.push(`${e.localHour}:00 there`),t.join(", ")}function an(e,t){if(!t.length)return"Nowhere to compare against right now.";let o=t.filter(d=>d.better);if(!o.length)return`Nowhere on the list beats ${e} right now.`;let n=o[0],s=o.length-1;return`${n.name} is better than ${e} right now \u2014 ${uo(n)}.`+(s>0?` So ${s===1?"is one other":`are ${s} others`}.`:"")}var ia="../countdown/stats.json",sn=[{place:"San Francisco, California",lat:37.7749,lon:-122.4194},{place:"Vancouver, Canada",lat:49.2497,lon:-123.1193},{place:"Grants Pass, Oregon",lat:42.4393,lon:-123.3307}],ra=600*1e3;function rn(e){e.className="panel elsewhere",e.innerHTML=`
    <div class="hd">ELSEWHERE<span class="rule"></span><span class="val" id="ew-count">\u2014</span></div>
    <div class="body">
      <div class="ew-list" id="ew-list"><div class="ew-empty">Looking\u2026</div></div>
      <p class="ew-say" id="ew-say"></p>
    </div>`;let t=S=>e.querySelector(`#${S}`),o=null,n=0,s=[],d="",g=!1;async function v(){if(o)return o;try{let S=await(await fetch(new URL(ia,location.href),{cache:"no-cache"})).json(),f=Array.isArray(S?.trips)?S.trips:[],l=new Date,p=`${l.getFullYear()}-${String(l.getMonth()+1).padStart(2,"0")}-${String(l.getDate()).padStart(2,"0")}`,a=m=>typeof m.date!="string"||(m.date.length===7?`${m.date}-01`:m.date)<=p,u=new Set;o=f.filter(m=>m&&typeof m.lat=="number"&&typeof m.lon=="number"&&a(m)&&typeof m.place=="string"&&!u.has(m.place)&&u.add(m.place)),o.length||(console.warn("ELSEWHERE: trip list had no usable coordinates; using the fallback"),o=sn)}catch(S){console.warn("ELSEWHERE: could not read the trip list, using the fallback \u2014",S.message),o=sn}return o}async function y(S){try{let l=(await ce.bundle(S.lat,S.lon))?.forecast?.data;if(!l?.current)return null;let p=Number(String(l.current.time||"").slice(11,13));return on(S.place,l.current,l.current_units,{localHour:Number.isFinite(p)?p:null})}catch{return null}}async function M(){let S=r.loc;if(!S||g)return;let f=`${S.lat?.toFixed(2)},${S.lon?.toFixed(2)}`;if(!(f===d&&Date.now()-n<ra)){g=!0;try{let l=await v(),p=await y({place:S.name||"here",lat:S.lat,lon:S.lon});if(!p)return;let a=(await Promise.all(l.map(y))).filter(Boolean);s=nn(p,a),d=f,n=Date.now(),i(p),c(p)}finally{g=!1}}}function i(S){let f=bt(S),l=s.filter(u=>u.better);if(t("ew-count").textContent=s.length?l.length?`${l.length} better`:"none better":"\u2014",!s.length){t("ew-list").innerHTML='<div class="ew-empty">No places to compare.</div>',t("ew-say").textContent="";return}let p=u=>`
      <div class="ew-row${u.better?" is-better":""}">
        <span class="ew-name">${oe(u.name)}</span>
        <span class="ew-what">${oe(uo(u))}</span>
      </div>`,a=`
      <div class="ew-here">
        <span class="ew-name">${oe(S.name)}</span>
        <span class="ew-what">here \xB7 ${oe(Vt(S)||"")}${Number.isFinite(f)?` \xB7 ${f}/100`:""}</span>
      </div>`;t("ew-list").innerHTML=l.map(p).join("")+a+s.filter(u=>!u.better).map(p).join(""),t("ew-say").textContent=an(S.name,s)}async function c(S){try{let f={here:S.name,hereSky:Vt(S),hereScore:bt(S),rows:s.map(a=>({name:a.name,delta:a.deltaShown??a.deltaC,sky:a.headline,better:a.better,night:a.night}))},l=btoa(unescape(encodeURIComponent(JSON.stringify(f)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),p=await ce.elsewhere(l);p?.text&&d&&(t("ew-say").textContent=p.text)}catch{}}return{update(){M()},onHide(){}}}function ln(e){e.className="view deck active",e.innerHTML=`
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
  `;let t=a=>e.querySelector("#"+a),o=rn(t("d-elsewhere")),n=le(t("d-meteo"),(a,u,m,h)=>{let E=Date.now();Ft(a,u,m,h,{hours:r.hours,days:r.days,tf:r.fmt,span:{lo:r.cursor-12*36e5,hi:r.cursor+36*36e5},cursor:r.cursor,now:E,panels:["temp","pop","wind"]})},{onPick:({x:a,w:u})=>{let m=r.cursor-432e5,h=r.cursor+36*36e5,E=u-34;r.playing=!1,r.scrubTo(m+(a-4)/E*(h-m))}}),s=le(t("d-spark"),(a,u,m)=>{let h=r.hours.filter($=>$.t>=r.cursor-36e5&&$.t<=r.cursor+864e5);if(h.length<2)return;let E=Uo(a,{x:0,y:4,w:u,h:m-14},h.map($=>$.temp),{color:j[0],glow:9});a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="center",a.textBaseline="bottom";for(let $=0;$<h.length;$+=6)Ne(a,r.fmt.hour(h[$].t).replace(/\s/g,""),$/(h.length-1)*u,m,0,u);a.restore(),E?.length&&(a.save(),a.fillStyle=ye,a.shadowColor=j[0],a.shadowBlur=5,a.beginPath(),a.arc(E[1]?.[0]??E[0][0],E[1]?.[1]??E[0][1],3,0,Math.PI*2),a.fill(),a.restore())}),d=le(t("d-moondisc"),(a,u,m)=>{let h=r.frame();h&&Ht(a,u/2,m/2,Math.max(10,Math.min(u,m)/2-3),h.moon.phase,h.moon.fraction)}),g=le(t("d-nc"),(a,u,m)=>{let h=wt(r);if(!h?.series?.length)return;let E=Math.max(...h.series.map(k=>k.p),.02),$=h.series.length,w=Math.max(1,u/$-.6);h.series.forEach((k,L)=>{let R=L*u/$,A=k.p>0?Math.max(1.5,k.p/E*m):0;A&&je(a,R,m-A,w,m,V(k.p>.08?N.crit:k.p>.02?j[0]:j[4],.9),2)}),a.save(),a.strokeStyle="rgba(255,255,255,.10)",a.beginPath(),a.moveTo(0,m-.5),a.lineTo(u,m-.5),a.stroke(),a.restore()}),v=[["g-wind",(a,u,m)=>{let h=r.frame(),E=Math.min(u,m)/2-16;Go(a,u/2,m/2-4,Math.max(14,E),{dir:h?.windDir,speed:h?.wind,gust:h?.gust,color:j[3]})}],["g-hum",(a,u,m)=>{let h=r.frame(),E=Math.min(u,m)/2-18;Ke(a,u/2,m/2-6,Math.max(14,E),{value:h?.rh,min:0,max:100,color:j[4],label:"humidity",unit:"%",sub:h?Ve(h.dew).name:""})}],["g-pres",(a,u,m)=>{let h=r.frame(),E=Math.min(u,m)/2-18,$=h?.pressure?h.pressure*.029529983:null;Ke(a,u/2,m/2-6,Math.max(14,E),{value:$,min:28.5,max:31,color:j[3],label:"pressure",unit:"inHg",decimals:2,sub:y()})}],["g-uv",(a,u,m)=>{let h=r.frame(),E=Math.min(u,m)/2-18;Ke(a,u/2,m/2-6,Math.max(14,E),{value:h?.uv,min:0,max:12,color:qe(h?.uv).color,label:"uv index",unit:"index",decimals:1,sub:qe(h?.uv).name,bands:[{from:0,to:3,color:N.good},{from:3,to:6,color:N.warn},{from:6,to:8,color:N.serious},{from:8,to:11,color:N.crit},{from:11,to:12,color:j[3]}]})}],["g-aqi",(a,u,m)=>{let E=r.frame()?.air?.aqi??r.airNow?.aqi,$=_e(E),w=Math.min(u,m)/2-18;Ke(a,u/2,m/2-6,Math.max(14,w),{value:E,min:0,max:200,color:$.color,label:"air quality",unit:"US AQI",sub:$.name.length>12?"SENSITIVE":$.name,bands:[{from:0,to:50,color:N.good},{from:50,to:100,color:N.warn},{from:100,to:150,color:N.serious},{from:150,to:200,color:N.crit}]})}],["g-vis",(a,u,m)=>{let h=r.frame(),E=h?.vis!=null?h.vis/1609.344:null,$=Math.min(u,m)/2-18;Ke(a,u/2,m/2-6,Math.max(14,$),{value:E==null?null:Math.min(E,10),min:0,max:10,color:j[0],label:"visibility",unit:"miles",decimals:1,sub:E==null?"":E>=9?"CLEAR":E>=3?"HAZY":E>=1?"POOR":"FOG"})}]].map(([a,u])=>le(t(a),u));function y(){let a=r.cursor,u=r.hours.find(E=>E.t>=a-3*36e5),m=r.hours.find(E=>E.t>=a);if(!u?.pressure||!m?.pressure)return"";let h=(m.pressure-u.pressure)*.029529983;return Math.abs(h)<.02?"STEADY":h>0?`RISING ${h.toFixed(2)}`:`FALLING ${Math.abs(h).toFixed(2)}`}function M(){let a=r.frame();if(!a)return;let u=r.fmt;t("d-temp").innerHTML=`${a.temp==null?"--":Math.round(a.temp)}<sup>\xB0F</sup>`,t("d-cond").textContent=a.wx.label,t("d-glyph").textContent=to(Math.round(a.code??0),a.isDay>.5),t("d-feels").textContent=Y.temp(a.feels),t("d-dew").textContent=Y.temp(a.dew),t("d-obs").textContent=r.atNow?`LIVE \xB7 ${eo(r.lastFetch)}`:`PROJECTED \xB7 ${u.hm(r.cursor)}`;let m=r.observed,h=t("d-obsline");if(r.atNow&&m?.tempF!=null){let O=a.temp!=null?a.temp-m.tempF:null;h.innerHTML=`observed <b>${Math.round(m.tempF)}\xB0</b><span> \xB7 ${oe(m.name||m.station)} ${m.distanceMi} mi \xB7 ${eo(Date.parse(m.time))}</span>`+(O!=null&&Math.abs(O)>=1.5?`<em> \xB7 model runs ${Y.signed(O,0)}\xB0</em>`:""),h.style.display=""}else h.style.display="none";let E=a.day;t("d-hi").textContent=Y.temp(E?.tmax),t("d-lo").textContent=Y.temp(E?.tmin);let $=t("d-anom"),w=r.climate?.doy?.[p(r.cursor)];if(w&&E?.tmax!=null){let O=E.tmax-w.normalHigh;$.textContent=`${Y.signed(O,1)}\xB0`,$.style.color=Math.abs(O)<2?pe:O>0?"#f2b45a":"#7fb2f0"}else $.textContent="--",$.style.color="";let k=r.sunTimesFor();t("d-sunrise").textContent=u.hm(k.sunrise),t("d-sunset").textContent=u.hm(k.sunset),t("d-daylight").textContent=E?.daylight?it(E.daylight):"--";let L=r.alerts,R=t("d-alertPanel");R.style.display=L.length?"":"none",t("d-alertN").textContent=String(L.length),t("d-alerts").innerHTML=L.slice(0,4).map(O=>`
      <div class="alert-item" style="--ac:${vt(O.event,O.severity)}">
        <b>${oe(O.event||"Alert")}</b>
        <span>until ${u.weekday(O.expires||O.ends)} ${u.hm(O.expires||O.ends)}</span>
      </div>`).join("");let A=wt(r),C=tn(A,u),P=t("d-ncline");if(C)P.textContent=C,P.className="nowcast-line wet";else{let O=r.hours.find(G=>G.t>Date.now()&&(G.pop??0)>=40);P.textContent=O?`Dry for 6+ hours. Next real chance ${u.weekday(O.t)} ${u.hm(O.t)} (${Math.round(O.pop)}%).`:"Dry. No meaningful precipitation in the forecast window.",P.className="nowcast-line"}t("d-ncres").textContent=A?`${A.resolution}-MIN`:"\u2014";let T=a.moon,D=r.moonTimesFor();t("d-moonname").textContent=`${Math.round(T.fraction*100)}% LIT`,t("d-sunmoon").innerHTML=`
      <dl style="margin:0">
        ${f("Sun altitude",`${a.sun.altDeg.toFixed(1)}\xB0 ${me(a.sun.compass)}`)}
        ${f("Golden hour",`${u.hm(k.goldenHour)} \u2013 ${u.hm(k.sunset)}`)}
        ${f("Blue hour",`${u.hm(k.sunset)} \u2013 ${u.hm(k.dusk)}`)}
        ${f("Astro dark",isNaN(+k.night)?"none tonight":u.hm(k.night))}
        ${f("Moon",`${l(T.phase)}`)}
        ${f("Moon alt",`${T.altDeg.toFixed(1)}\xB0 ${me(T.compass)}`)}
        ${f("Moonrise",D.rise?u.hm(D.rise):"\u2014")}
        ${f("Moonset",D.set?u.hm(D.set):"\u2014")}
      </dl>`;let z=Ct(a.wind);t("n-wind").textContent=`${z.name} \xB7 from ${me(a.windDir)}`,t("n-hum").textContent=Ve(a.dew).note,t("n-pres").textContent=a.pressure?`${Math.round(a.pressure)} hPa`:"";let W=At(a.uv,r.settings.skinType);t("n-uv").textContent=W==null?"no burn risk":W>180?"burn risk negligible":`burn in ~${W} min`;let U=a.air?.aqi??r.airNow?.aqi;t("n-aqi").textContent=a.air?.pm25!=null?`PM2.5 ${a.air.pm25.toFixed(1)} \xB5g/m\xB3`:U!=null?"":"no data",t("n-vis").textContent=a.vis!=null?`${(a.vis/1609.344).toFixed(1)} mi`:"",t("d-instnote").textContent=r.atNow?"LIVE":u.hm(r.cursor),c(),S(),d.render();for(let O of v)O.render();n.render(),s.render(),g.render()}let i=null;function c(){let a=r.fmt,u=E=>`${a.weekday(E)} ${a.hour(E)}`,m=(E,$)=>a.isoDate(E)===a.isoDate($)?`${a.weekday(E)} ${a.hour(E)}\u2013${a.hour($)}`:`${u(E)} \u2013 ${u($)}`,h=Bt.map(E=>{let $=Wt(E),w=Gt(E,r,{hours:36,limit:1,minScore:50})[0],k=en(E,r,{hours:36,at:90});return{k:E,meta:$,w,g:k}}).sort((E,$)=>$.g.great-E.g.great||($.w?.peak??0)-(E.w?.peak??0));t("d-act").innerHTML=h.map(({k:E,meta:$,w,g:k})=>{let L=k.great,R=k.eligible?L/k.eligible:0,A=L>0?N.good:(w?.peak??0)>=60?N.warn:N.serious,C=w?`<b class="act-best">Best ${u(w.peakAt)}</b><span class="act-good">Good ${m(w.start,w.end)}</span>`+(L===0?`<span class="act-note">Best hour scores ${w.peak}/100</span>`:"")+(w.limiter?`<span class="act-note">Held back by ${w.limiter}</span>`:""):'<span class="act-note">No good time in the next 36 hours</span>',P=i===E&&w,T=w?w.parts.map(D=>{let z=Math.round((1-D.value)*D.weight*100);return`<span class="act-factor"><span class="act-fname">${D.name}</span><span class="meter act-fbar" style="--ac:${z===0?N.good:D.value>=.6?N.warn:N.serious}"><i style="width:${Math.round(D.value*100)}%"></i></span><span class="act-fpts">${z?"\u2212"+z:"full marks"}</span></span>`}).join(""):"";return`
        <button type="button" class="act-row" data-act="${E}" aria-expanded="${P?"true":"false"}"
                aria-controls="act-why-${E}"${w?"":" disabled"}>
          <span class="act-icon" style="color:${$.color}">${$.icon}</span>
          <span class="act-text">
            <span class="act-name">${$.label}</span>
            <span class="act-when">${C}</span>
            <span class="meter act-bar" style="--ac:${A}"><i style="width:${Math.round(R*100)}%"></i></span>
          </span>
          <span class="act-score" style="color:${A}">${L}<small class="act-unit">great hours</small></span>
        </button>
        <div class="act-why" id="act-why-${E}"${P?"":" hidden"}>
          <span class="act-whyhd">Why the best hour (${w?u(w.peakAt):""}) scores ${w?.peak??0}</span>${T}
        </div>`}).join("")}t("d-act").addEventListener("click",a=>{let u=a.target.closest(".act-row");!u||u.disabled||(i=i===u.dataset.act?null:u.dataset.act,c(),t("d-act").querySelector(`.act-row[data-act="${u.dataset.act}"]`)?.focus())}),t("d-act").addEventListener("keydown",a=>{if(a.key!=="Escape"||!i)return;let u=i;i=null,c(),t("d-act").querySelector(`.act-row[data-act="${u}"]`)?.focus()});function S(){let a=r.fmt,u=a.isoDate(Date.now()),m=r.days.filter(k=>k.tmax!=null&&a.isoDate(k.t)>=u);if(!m.length)return;let h=Math.min(...m.map(k=>k.tmin)),E=Math.max(...m.map(k=>k.tmax)),$=a.isoDate(Date.now()),w=a.isoDate(r.cursor);t("d-tenday").innerHTML=m.map(k=>{let L=a.isoDate(k.t),R=(E-k.tmax)/(E-h||1)*100,A=(k.tmin-h)/(E-h||1)*100,C=`linear-gradient(to top, ${Le(k.tmin)}, ${Le(k.tmax)})`;return`
        <div class="tenday-col ${L===$?"today":""} ${L===w?"cursor":""}" data-t="${k.t}">
          <div class="td-day">${L===$?"TODAY":a.weekday(k.t)}</div>
          <div class="td-date">${a.monthDay(k.t)}</div>
          <div class="td-glyph" title="${Xe(Math.round(k.code)).long}">${to(Math.round(k.code),!0)}</div>
          <div class="td-hi">${Math.round(k.tmax)}\xB0</div>
          <div class="td-bar"><i style="top:${R}%;bottom:${A}%;background:${C};box-shadow:0 0 8px ${Le(k.tmax)}66"></i></div>
          <div class="td-lo">${Math.round(k.tmin)}\xB0</div>
          <div class="td-pop">${(k.pop??0)>=10?`${Math.round(k.pop)}%`:""}</div>
        </div>`}).join(""),t("d-tdnote").textContent=`${m.length} DAYS AHEAD`,t("d-tenday").querySelectorAll(".tenday-col").forEach(k=>{k.addEventListener("click",()=>{r.playing=!1,r.scrubTo(+k.dataset.t+13*36e5)})})}let f=(a,u)=>`<div class="kv"><dt>${a}</dt><dd>${u}</dd></div>`,l=a=>["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous","Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"][Math.round((a%1+1)%1*8)%8],p=a=>{let u=r.fmt.isoDate(a),[,m,h]=u.split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][m-1]+h-1};return{update(){M(),o.update()},onHide(){o.onHide()}}}var ft="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas",Kt="grayscale(1) brightness(1.18) contrast(1.05) sepia(.6) hue-rotate(170deg) saturate(1.3)",Yt="grayscale(1) brightness(1.9) contrast(1.1) sepia(.4) hue-rotate(170deg) saturate(.8)";var be={lonToWorld:(e,t)=>(e+180)/360*Math.pow(2,t)*256,latToWorld:(e,t)=>{let o=Math.sin(Math.max(-85.05,Math.min(85.05,e))*Math.PI/180);return(.5-Math.log((1+o)/(1-o))/(4*Math.PI))*Math.pow(2,t)*256},worldToLon:(e,t)=>e/(Math.pow(2,t)*256)*360-180,worldToLat:(e,t)=>{let o=Math.PI-2*Math.PI*e/(Math.pow(2,t)*256);return 180/Math.PI*Math.atan(.5*(Math.exp(o)-Math.exp(-o)))}},nt=new Map,jt=0,la=[1500,4e3];function cn(e,t,o){let n=new Image;t.img=n,t.state="loading",jt++,n.crossOrigin="anonymous",n.onload=()=>{t.state="ok",jt--,o?.()},n.onerror=()=>{jt--;let s=la[t.tries++];if(s===void 0){t.state="err";return}setTimeout(()=>{nt.get(e)===t&&cn(e,t,o)},s)},n.src=e}function dn(e,t){let o=nt.get(e);if(o)return o.state==="ok"?o.img:null;if(jt>24)return null;let n={img:null,state:"loading",tries:0};if(nt.set(e,n),cn(e,n,t),nt.size>600){let s=Math.floor(150);for(let d of nt.keys()){if(s--<=0)break;nt.delete(d)}}return null}var da=10,ut=class{constructor(t,{center:o=[0,0],zoom:n=7,minZoom:s=2,maxZoom:d=12,onMove:g,onTap:v}={}){this.canvas=t,this.ctx=t.getContext("2d"),this.lat=o[0],this.lon=o[1],this.zoom=n,this.minZoom=s,this.maxZoom=d,this.onMove=g,this.onTap=v,this.layers=[],this.overlays=[],this.dirty=!0,this.w=0,this.h=0,this._raf=null,this._bind(),this._ro=new ResizeObserver(()=>this.resize()),this._ro.observe(t),this.resize()}resize(){let t=Math.min(window.devicePixelRatio||1,2),o=this.canvas.clientWidth,n=this.canvas.clientHeight;!o||!n||(this.canvas.width=Math.round(o*t),this.canvas.height=Math.round(n*t),this.ctx.setTransform(t,0,0,t,0,0),this.w=o,this.h=n,this.invalidate())}invalidate(){this._raf||(this._raf=requestAnimationFrame(()=>{this._raf=null,this.render()}))}setView(t,o,n){this.lat=t,this.lon=o,n!=null&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n))),this.invalidate(),this.onMove?.(this)}project(t,o){let n=this.zoom;return[be.lonToWorld(o,n)-be.lonToWorld(this.lon,n)+this.w/2,be.latToWorld(t,n)-be.latToWorld(this.lat,n)+this.h/2]}unproject(t,o){let n=this.zoom;return[be.worldToLat(be.latToWorld(this.lat,n)+o-this.h/2,n),be.worldToLon(be.lonToWorld(this.lon,n)+t-this.w/2,n)]}_placeAt(t,o,n,s){let d=this.zoom;this.lon=be.worldToLon(be.lonToWorld(o,d)+this.w/2-n,d),this.lat=Math.max(-85,Math.min(85,be.worldToLat(be.latToWorld(t,d)+this.h/2-s,d)))}_zoomAbout(t,o,n){let[s,d]=this.unproject(t,o);this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n)),this._placeAt(s,d,t,o)}_bind(){let t=this.canvas,o=new Map,n=null,s=null,d=M=>({x:M.clientX-s.left,y:M.clientY-s.top}),g=()=>{let M=[...o.values()];return{n:M.length,x:M.reduce((i,c)=>i+c.x,0)/M.length,y:M.reduce((i,c)=>i+c.y,0)/M.length,span:M.length<2?0:Math.hypot(M[0].x-M[1].x,M[0].y-M[1].y)}},v=()=>{if(!o.size){n=null;return}let M=g(),[i,c]=this.unproject(M.x,M.y);n={lat:i,lon:c,span:M.span,zoom:this.zoom}};t.addEventListener("pointerdown",M=>{if(o.size>=2)return;s=t.getBoundingClientRect();let i=d(M);o.set(M.pointerId,{...i,x0:i.x,y0:i.y});try{t.setPointerCapture(M.pointerId)}catch{}v(),t.style.cursor="grabbing"}),t.addEventListener("pointermove",M=>{if(!n||!o.has(M.pointerId))return;let i=o.get(M.pointerId);o.set(M.pointerId,{...d(M),x0:i.x0,y0:i.y0});let c=g();c.n>1&&n.span>20&&c.span>8&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n.zoom+Math.log2(c.span/n.span)))),this._placeAt(n.lat,n.lon,c.x,c.y),this.invalidate(),this.onMove?.(this)});let y=M=>{let i=o.get(M.pointerId);if(o.delete(M.pointerId)){try{t.releasePointerCapture(M.pointerId)}catch{}this.onTap&&!o.size&&Math.hypot(i.x-i.x0,i.y-i.y0)<da&&this.onTap({x:i.x,y:i.y},M),v(),o.size||(t.style.cursor="grab")}};t.addEventListener("pointerup",y),t.addEventListener("pointercancel",y),t.addEventListener("wheel",M=>{M.preventDefault();let i=t.getBoundingClientRect(),c=-M.deltaY*(M.deltaMode===1?.05:.0022);this._zoomAbout(M.clientX-i.left,M.clientY-i.top,this.zoom+c),this.invalidate(),this.onMove?.(this)},{passive:!1});for(let M of["gesturestart","gesturechange","gestureend"])t.addEventListener(M,i=>i.preventDefault());t.style.cursor="grab",t.style.touchAction="none"}_layerTiles(t,o,n,s){let{w:d,h:g}=this,v=Math.min(o,t.maxTileZoom??o),y=256*Math.pow(2,this.zoom-v),M=Math.pow(2,v),i=Math.floor(n/y),c=Math.floor((n+d)/y),S=Math.floor(s/y),f=Math.floor((s+g)/y),l=[];for(let p=S;p<=f;p++)if(!(p<0||p>=M))for(let a=i;a<=c;a++){let u=(a%M+M)%M,m=t.url(v,u,p);m&&l.push({tx:a,ty:p,url:m})}return{size:y,tiles:l}}tilesSettled(t,o){let n=this.layers.find(M=>M.name===t);if(!n||n.enabled===!1||n.opacity===0||!this.w||!this.h)return!0;let s=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),d=be.lonToWorld(this.lon,this.zoom)-this.w/2,g=be.latToWorld(this.lat,this.zoom)-this.h/2,{tiles:v}=this._layerTiles(o?{...n,url:o}:n,s,d,g),y=!0;for(let M of v){o&&dn(M.url,()=>this.invalidate());let i=nt.get(M.url)?.state;i!=="ok"&&i!=="err"&&(y=!1)}return y}render(){let{ctx:t,w:o,h:n}=this;if(!o||!n)return;t.clearRect(0,0,o,n),t.fillStyle="#0f1826",t.fillRect(0,0,o,n);let s=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),d=be.lonToWorld(this.lon,this.zoom)-o/2,g=be.latToWorld(this.lat,this.zoom)-n/2,v=()=>this.invalidate();for(let y of this.layers){if(y.enabled===!1||y.opacity===0)continue;let{size:M,tiles:i}=this._layerTiles(y,s,d,g);t.save(),t.globalAlpha=y.opacity??1,y.filter&&(t.filter=y.filter),y.blend&&(t.globalCompositeOperation=y.blend);let c=.5;for(let{tx:S,ty:f,url:l}of i){let p=dn(l,v);p&&t.drawImage(p,Math.round(S*M-d)-c,Math.round(f*M-g)-c,Math.ceil(M)+c*2,Math.ceil(M)+c*2)}t.restore()}for(let y of this.overlays){t.save();try{y(t,this)}catch(M){console.error("[map overlay]",M)}t.restore()}}destroy(){this._ro.disconnect()}};function un(e,t,o,{stroke:n,fill:s,width:d=1.5,glow:g=8}){if(!o)return;let v=o.type==="Polygon"?[o.coordinates]:o.type==="MultiPolygon"?o.coordinates:null;if(v){e.beginPath();for(let y of v)for(let M of y)M.forEach(([i,c],S)=>{let[f,l]=t.project(c,i);S===0?e.moveTo(f,l):e.lineTo(f,l)}),e.closePath();s&&(e.fillStyle=s,e.fill("evenodd")),n&&(e.save(),g&&(e.shadowColor=n,e.shadowBlur=g/2),e.strokeStyle=n,e.lineWidth=d,e.stroke(),e.restore())}}function xt(e,t,o,n="#f07aa6",s=null,d=0){e.save(),e.shadowColor=n,e.shadowBlur=7,e.strokeStyle=n,e.lineWidth=1.5;let g=7;e.beginPath(),e.arc(t,o,g,0,Math.PI*2),e.stroke(),e.beginPath();for(let[v,y]of[[-1,0],[1,0],[0,-1],[0,1]])e.moveTo(t+v*(g+2),o+y*(g+2)),e.lineTo(t+v*(g+7),o+y*(g+7));if(e.stroke(),e.fillStyle=n,e.beginPath(),e.arc(t,o,2.2,0,Math.PI*2),e.fill(),d>0&&(e.globalAlpha=1-d,e.beginPath(),e.arc(t,o,g+d*26,0,Math.PI*2),e.stroke(),e.globalAlpha=1),s){e.shadowBlur=0,e.font="600 11.5px 'Chakra Petch', sans-serif",e.letterSpacing="1.4px",e.textAlign="left",e.textBaseline="middle";let v=e.measureText(s).width+10;e.fillStyle="rgba(22,33,47,.85)",e.fillRect(t+g+8,o-7,v,14),e.fillStyle=n,e.fillText(s,t+g+13,o)}e.restore()}function Zt(e,t,o,n){let s=156543.03392*Math.cos(t.lat*Math.PI/180)/Math.pow(2,t.zoom),g=s*110/1609.344,y=[1,2,5,10,20,50,100,200,500,1e3].reduce((i,c)=>Math.abs(c-g)<Math.abs(i-g)?c:i),M=y*1609.344/s;e.save(),e.strokeStyle="rgba(221,226,232,.75)",e.lineWidth=1,e.beginPath(),e.moveTo(o,n-4),e.lineTo(o,n),e.lineTo(o+M,n),e.lineTo(o+M,n-4),e.stroke(),e.font="500 11.5px 'JetBrains Mono', monospace",e.fillStyle="rgba(221,226,232,.75)",e.textAlign="center",e.textBaseline="bottom",e.fillText(`${y} mi`,o+M/2,n-5),e.restore()}var ca=5;function fn(e){e.className="view radar",e.innerHTML=`
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
  `;let t=A=>e.querySelector("#"+A),o=[],n=0,s=0,d=!1,g=0,v="",y=null,M=performance.now(),i="",c=new ut(t("r-map"),{center:[r.loc?.lat??0,r.loc?.lon??0],zoom:7,minZoom:3,maxZoom:11,onMove:()=>h()}),S=A=>(C,P,T)=>!A||!i?null:`${i}${A.path}/256/${C}/${P}/${T}/4/1_1.png`;c.layers=[{name:"base",url:(A,C,P)=>`${ft}/World_Dark_Gray_Base/MapServer/tile/${A}/${P}/${C}`,filter:Kt,opacity:1},{name:"radar",url:(A,C,P)=>S(o[n])(A,C,P),opacity:.82,blend:"screen",maxTileZoom:7},{name:"labels",url:(A,C,P)=>`${ft}/World_Dark_Gray_Reference/MapServer/tile/${A}/${P}/${C}`,filter:Yt,opacity:1}];let f=A=>c.layers.find(C=>C.name===A);c.overlays.push((A,C)=>{if(f("alerts")?.enabled!==!1&&l)for(let P of r.alerts){if(!P.geometry)continue;let T=vt(P.event,P.severity);un(A,C,P.geometry,{stroke:T,fill:V(T,.12),width:1.5,glow:10})}if(r.loc){let[P,T]=C.project(r.loc.lat,r.loc.lon);xt(A,P,T,j[1],r.loc.name.toUpperCase())}Zt(A,C,14,C.h-14),A.save(),A.strokeStyle="rgba(63,208,216,.06)",A.lineWidth=1;for(let P=1;P<4;P++)A.beginPath(),A.moveTo(C.w*P/4,0),A.lineTo(C.w*P/4,C.h),A.moveTo(0,C.h*P/4),A.lineTo(C.w,C.h*P/4),A.stroke();A.restore()});let l=!0,p=le(t("r-strip"),(A,C,P)=>{if(!o.length)return;let T=o.length,D=Math.max(2,C/T-2),z=o.findIndex(W=>W.kind==="nowcast");if(o.forEach((W,U)=>{let O=U*C/T,G=W.kind==="past",X=U===n?j[1]:G?j[0]:N.warn;A.fillStyle=V(X,U===n?1:.3),A.fillRect(O,U===n?2:6,D,U===n?P-4:P-12)}),z>0){let W=z*C/T-1;A.save(),A.strokeStyle=V(N.warn,.8),A.setLineDash([2,2]),A.beginPath(),A.moveTo(W,0),A.lineTo(W,P),A.stroke(),A.restore()}},{onPick:({x:A,w:C})=>{if(!o.length)return;let P=o[H(Math.floor(A/C*o.length),0,o.length-1)];r.playing=!1,r.emit("play",!1),r.scrubTo(P.time*1e3)}});function a(A){let C=0,P=1/0;for(let T=0;T<o.length;T++){let D=Math.abs(o[T].time*1e3-A);D<P&&(P=D,C=T)}return C}function u(){if(!o.length)return;let A=a(r.cursor);A!==n&&(n=A,E())}function m(){t("r-play").textContent=r.playing?"\u275A\u275A":"\u25B6"}let h=()=>p.render();function E(){let A=o[n];if(!A)return;t("r-time").textContent=r.fmt.hm(A.time*1e3);let C=Math.round((Date.now()/1e3-A.time)/60);t("r-age").textContent=A.kind==="nowcast"?`FORECAST +${Math.abs(C)}m`:C<=1?"LATEST":`${C} MIN AGO`,t("r-age").style.color=A.kind==="nowcast"?N.warn:C<=12?N.good:pe,c.invalidate(),p.render()}async function $(){try{let A=r.radar||await ce.radar();i=A.host;let C=(A.radar?.past||[]).map(T=>({...T,kind:"past"})),P=(A.radar?.nowcast||[]).map(T=>({...T,kind:"nowcast"}));o=[...C,...P],n=a(r.cursor),t("r-src").textContent=P.length?`${C.length} OBS + ${P.length} FCST`:`${C.length} OBSERVED`,E(),w()}catch(A){console.error("[radar] frames",A),t("r-src").textContent="UNAVAILABLE"}}function w(){let A=[["#62a4ef","light"],["#6cc98f","moderate"],["#ecd46a","heavy"],["#f59a5b","very heavy"],["#f47171","intense"],["#c89af5","hail"]];t("r-legend").innerHTML='<span class="lg-title">intensity</span>'+A.map(([C,P])=>`<b><i style="background:${C}"></i>${P}</b>`).join("")}function k(){let A=r.fmt,C=r.frame(),P=[C?.t,C?.precip,C?.cape,C?.cloud,r.alerts.length,r.hours.length].join("|");if(P===v&&r.raw===y)return;v=P,y=r.raw;let T=r.alerts;t("r-alertn").textContent=String(T.length),t("r-alertlist").innerHTML=T.length?T.map(Q=>`
      <div class="alert-item" style="--ac:${vt(Q.event,Q.severity)}">
        <b>${oe(Q.event)}</b>
        <span>${oe(Q.areaDesc||"").slice(0,90)}</span><br>
        <span>until ${A.weekday(Q.expires)} ${A.hm(Q.expires)}</span>
      </div>`).join(""):'<div class="nodata">no active alerts</div>';let D=r.frame(),z=r.hours.filter(Q=>Q.t>=Date.now()&&Q.t<=Date.now()+6*36e5),W=z.reduce((Q,J)=>Q+(J.precip??0),0),U=Math.max(0,...z.map(Q=>Q.pop??0));t("r-cover").innerHTML=`
      <dl style="margin:0">
        ${R("Now",D?.wx.label??"--")}
        ${R("Rate",D?.precip!=null?`${D.precip.toFixed(3)} in/hr`:"--")}
        ${R("Next 6h total",`${W.toFixed(2)} in`)}
        ${R("Peak chance 6h",`${Math.round(U)}%`)}
        ${R("Cloud cover",D?.cloud!=null?`${Math.round(D.cloud)}%`:"--")}
        ${R("Freezing level",D?.freezing!=null?`${Math.round(D.freezing*3.28084)} ft`:"--")}
      </dl>`;let O=D?.cape??0,G=D?.li,X=D?.cin,B=O<300?["STABLE",N.good]:O<1e3?["MARGINAL",j[0]]:O<2500?["MODERATE",N.warn]:O<4e3?["STRONG",N.serious]:["EXTREME",N.crit],Z=Math.max(0,...r.hours.filter(Q=>Q.t>=Date.now()&&Q.t<=Date.now()+24*36e5).map(Q=>Q.cape??0));t("r-conv").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px">
        <span class="num" style="font-size:1.5rem;font-weight:700;color:${B[1]}">${Math.round(O)}</span>
        <span class="lbl">J/kg CAPE</span>
        <span class="chip" style="--ac:${B[1]};margin-left:auto">${B[0]}</span>
      </div>
      <div class="meter seg" style="--ac:${B[1]};margin-bottom:8px"><i style="width:${H(O/4e3*100,0,100)}%"></i></div>
      <dl style="margin:0">
        ${R("Lifted index",G!=null?G.toFixed(1):"--")}
        ${R("Inhibition",X!=null?`${Math.round(X)} J/kg`:"--")}
        ${R("Peak CAPE 24h",`${Math.round(Z)} J/kg`)}
      </dl>
      <div style="font-size:max(.58rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        CAPE is the energy available to a rising parcel. Above ~1000 J/kg with a
        negative lifted index, thunderstorms become plausible.
      </div>`}t("r-play").addEventListener("click",()=>{r.playing=!r.playing,r.emit("play",r.playing),m()}),r.on("play",m),r.on("cursor",()=>{r.view==="radar"&&(u(),m())}),t("r-center").addEventListener("click",()=>{r.loc&&c.setView(r.loc.lat,r.loc.lon,7)}),t("r-zin").addEventListener("click",()=>c.setView(c.lat,c.lon,c.zoom+1)),t("r-zout").addEventListener("click",()=>c.setView(c.lat,c.lon,c.zoom-1)),t("r-labels").addEventListener("click",A=>{let C=f("labels");C.enabled=C.enabled===!1,A.currentTarget.classList.toggle("on",C.enabled!==!1),c.invalidate()}),t("r-alerts").addEventListener("click",A=>{l=!l,A.currentTarget.classList.toggle("on",l),c.invalidate()});function L(A){if(r.view!=="radar"){M=A;return}let C=Math.min(.2,(A-M)/1e3);if(M=A,r.playing&&o.length){if(!d){if(g+=C,!c.tilesSettled("radar")&&g<ca)return;d=!0}s+=C;let P=n===o.length-1?1.1:.42;if(s>=P){let T=-1;for(let D=1;D<=o.length;D++){let z=(n+D)%o.length;if(z===n||c.tilesSettled("radar",S(o[z]))){T=z;break}}if(T<0||T===n){s=P-.1;return}s=0,r.hours.length?r.setCursor(o[T].time*1e3):(n=T,E())}}}requestAnimationFrame(function A(C){requestAnimationFrame(A),L(C)}),r.on("loc",()=>{r.loc&&c.setView(r.loc.lat,r.loc.lon,7)}),r.on("radar",$);let R=(A,C)=>`<div class="kv"><dt>${A}</dt><dd>${C}</dd></div>`;return $(),{map:c,update(){k(),c.invalidate()},onShow(){d=!1,g=0,s=0,c.resize(),p.render(),u(),r.playing=!0,r.emit("play",!0),m()},onHide(){r.playing=!1,r.emit("play",!1),r.following&&r.setCursor(Date.now())}}}function ua(e,t){if(!e?.length)return null;let o=null,n=1/0;for(let s of e){let d=Math.abs(s.t-t);d<n&&(n=d,o=s)}return n<=36e5?o:null}function hn(e,t){for(let o of t){let n=e[o];if(n instanceof Date&&!Number.isNaN(+n))return{at:+n,kind:o}}return null}function fa(e,t,o,n,s){let d=hn(t,["night","nauticalDusk","dusk"]),g=hn(o,["nightEnd","nauticalDawn","dawn"]);if(!d||!g||g.at<=d.at)return{dark:null,samples:[],goodHours:0,score:0,reason:"no darkness"};let v=[],y=Math.ceil(d.at/36e5)*36e5;for(let w=y;w<=g.at;w+=36e5){let k=ua(e,w);if(!k)continue;let L=s(w),R=n(w)>0;v.push({t:w,cloud:k.cloud??null,moonUp:R,moonLit:L,washed:R&&L>=.25,clear:k.cloud!=null&&k.cloud<=30})}if(!v.length)return{dark:{from:d.at,to:g.at,kind:d.kind},samples:[],goodHours:0,score:0,reason:"beyond the forecast"};let M=w=>w.clear&&!w.washed,i=v.filter(M).length,c=v.filter(w=>w.clear).length,S=v.filter(w=>w.cloud!=null),f=S.length?S.reduce((w,k)=>w+k.cloud,0)/S.length:null,l=null,p=null;for(let w of v.concat([null])){if(w&&M(w)){p=p||{from:w.t,to:w.t},p.to=w.t+36e5;continue}p&&(!l||p.to-p.from>l.to-l.from)&&(l=p),p=null}let a=(g.at-d.at)/36e5,u=s(d.at+(g.at-d.at)/2),m=v.filter(w=>w.moonUp).length/v.length,h=l?(l.to-l.from)/36e5:0,E=.65*Math.min(1,h/4)+.25*Math.min(1,i/Math.max(a,1))+.1*Math.min(1,a/6),$=Math.round(100*Math.max(0,Math.min(1,E)-.08*m*u));return{dark:{from:d.at,to:g.at,kind:d.kind,hours:a},samples:v,goodHours:i,clearHours:c,cloudMean:f,moonLit:u,moonUpHours:v.filter(w=>w.moonUp).length,best:l,score:$}}function mn(e,t,o,n,s,d=7,g=null){let{sunTimes:v,moonPosition:y,moonIllumination:M,toDeg:i}=s,c=[],S=g==null?(()=>{let p=new Date(n);return p.setHours(12,0,0,0),+p})():Math.floor((n+g)/(24*36e5))*24*36e5+12*36e5-g,f=p=>i(y(new Date(p),t,o).altitude),l=p=>M(new Date(p)).fraction;for(let p=0;p<d;p++){let a=new Date(S+p*24*36e5),u=new Date(S+(p+1)*24*36e5),m=fa(e,v(a,t,o),v(u,t,o),f,l);c.push({...m,index:p,day:+a})}return c}function fo(e){return e.slice(1).reduce((t,o)=>o.score>(t?.score??-1)?o:t,null)}function pn(e,t){let o=e[0],n=i=>t.hm(i);if(!o||!o.dark)return"No real darkness tonight at this latitude.";if(!o.samples.length)return"Tonight is beyond the forecast.";let s=fo(e),d=s&&s.score>o.score+15?s:null,g=i=>i.index===1?"Tomorrow":t.weekday(i.day),v=(i,c)=>`${i} ${c}${i===1?"":"s"}`,y=d?` ${g(d)} is the better night: ${v(d.goodHours,"clear moonless hour")}.`:"";if(o.best&&o.best.to-o.best.from>=2*36e5){let i=(o.best.to-o.best.from)/36e5,c=Math.round(i),S=o.moonLit>=.25&&o.moonUpHours?`, and the moon is ${Math.round(o.moonLit*100)}% lit`:"";if(o.dark.hours-i<1)return`Clear and moonless all night \u2014 about ${v(c,"hour")}, ${n(o.best.from)} to ${n(o.best.to)}${S}.`+y;if(c<3){let f=o.cloudMean!=null&&o.cloudMean>30?`, in a night averaging ${Math.round(o.cloudMean)}% cloud`:o.dark.hours<4?`, which is most of the ${v(Math.round(o.dark.hours),"hour")} of darkness`:"";return`A ${c}-hour window from ${n(o.best.from)}${f}${S}.`+y}return`Clear and moonless from ${n(o.best.from)} to ${n(o.best.to)} \u2014 about ${v(c,"hour")}${S}.`+y}return`Not tonight \u2014 ${o.cloudMean!=null&&o.cloudMean>30?`${Math.round(o.cloudMean)}% cloud through the dark hours`:o.moonUpHours&&o.moonLit>=.25?`a ${Math.round(o.moonLit*100)}% moon up for most of it`:"not much dark sky to work with"}.`+y}function gn(e){e.className="view skyview",e.innerHTML=`
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
  `;let t=a=>e.querySelector("#"+a),o=null;function n(){let{lat:a,lon:u}=r.loc||{lat:0,lon:0},m=r.fmt.isoDate(r.cursor),h=r.cursor;for(;r.fmt.isoDate(h-6e4)===m;)h-=6e4;let E=[],$=[];for(let w=0;w<=1440;w+=10){let k=new Date(h+w*6e4),L=Ze(k,a,u),R=Je(k,a,u);E.push({az:Fe(L.azimuth),alt:ze(L.altitude),t:+k}),$.push({az:Fe(R.azimuth),alt:ze(R.altitude),t:+k})}return{sun:E,moon:$,t0:h}}let s=le(t("s-dome"),(a,u,m,h)=>{let E=r.frame();if(!E)return;let{sun:$,moon:w}=n(),k=Math.min(u,m)/2-26,L=u/2,R=m/2;qo(a,L,R,k,{sunTrack:$,moonTrack:w,sun:{az:E.sun.compass,alt:E.sun.altDeg},moon:{az:E.moon.compass,alt:E.moon.altDeg},iss:o&&o.alt>0?o:null,night:E.sun.altDeg<-6?1:0}),a.save(),a.font="500 12px 'JetBrains Mono', monospace",a.textAlign="left",a.textBaseline="top";let A=[["SUN",`${E.sun.altDeg.toFixed(1)}\xB0  ${me(E.sun.compass)}`,"#f2b45a"],["MOON",`${E.moon.altDeg.toFixed(1)}\xB0  ${me(E.moon.compass)}`,"#7fb2f0"]];o&&A.push(["ISS",`${o.alt>0?`${o.alt.toFixed(0)}\xB0 ${me(o.az)}`:"below horizon"}`,"#8fdc6a"]),A.forEach(([C,P,T],D)=>{a.fillStyle=T,a.fillText(C,10,10+D*15),a.fillStyle=ye,a.fillText(P,52,10+D*15)}),a.restore()}),d=le(t("s-moon"),(a,u,m)=>{let h=r.frame();if(!h)return;let E=Math.min(u,m)/2-4;Ht(a,u/2,m/2,Math.max(10,E),h.moon.phase,h.moon.fraction)}),g=le(t("s-moonalt"),(a,u,m)=>{let{sun:h,moon:E}=n(),$={l:2,r:22,t:12,b:12},w={x:$.l,y:$.t,w:u-$.l-$.r,h:m-$.t-$.b};if(w.w<30||w.h<20)return;let k=A=>w.y+w.h-(H(A,-60,90)+60)/150*w.h,L=A=>w.x+A/(E.length-1)*w.w;a.save(),a.strokeStyle="rgba(63,208,216,.30)",a.setLineDash([3,3]),a.beginPath(),a.moveTo(w.x,k(0)),a.lineTo(w.x+w.w,k(0)),a.stroke(),a.setLineDash([]),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="right",a.textBaseline="middle",a.fillText("0\xB0",w.x+w.w+18,k(0)),a.restore(),Te(a,h.map((A,C)=>[L(C),k(A.alt)]),"#f2b45a",{width:1.4,glow:6}),a.save(),a.setLineDash([3,3]),Te(a,E.map((A,C)=>[L(C),k(A.alt)]),"#7fb2f0",{width:1.6,glow:7}),a.restore();let R=H(Math.round((r.cursor-E[0].t)/(E.at(-1).t-E[0].t)*(E.length-1)),0,E.length-1);a.save(),a.strokeStyle=j[1],a.lineWidth=1,a.beginPath(),a.moveTo(L(R),w.y),a.lineTo(L(R),w.y+w.h),a.stroke(),a.restore(),a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="center",a.textBaseline="top";for(let A=0;A<=24;A+=6)A!==24&&Ne(a,String(A).padStart(2,"0"),L(A/24*(E.length-1)),m-$.b+1,0,u);a.restore(),Se(a,w.x+2,1,"altitude \u2014 sun solid, moon dashed")}),v=le(t("s-daybar"),(a,u,m)=>{let h=r.sunTimesFor(),E=r.fmt.isoDate(r.cursor),$=r.cursor;for(;r.fmt.isoDate($-6e4)===E;)$-=6e4;let w=$+24*36e5,k=T=>(T-$)/(w-$)*u,L=8,R=16,A=(T,D,z)=>{if(T==null||D==null||isNaN(+T)||isNaN(+D))return;let W=H(k(+T),0,u),U=H(k(+D),0,u);U<=W||(a.fillStyle=z,a.fillRect(W,L,U-W,R))};a.fillStyle="#0f1826",a.fillRect(0,L,u,R),A(h.nightEnd,h.nauticalDawn,"rgba(30,20,70,.9)"),A(h.nauticalDawn,h.dawn,"rgba(40,40,120,.9)"),A(h.dawn,h.sunrise,"rgba(90,60,150,.9)"),A(h.sunrise,h.goldenHourEnd,"rgba(245,154,91,.85)"),A(h.goldenHourEnd,h.goldenHour,"rgba(90,180,235,.75)"),A(h.goldenHour,h.sunset,"rgba(245,154,91,.85)"),A(h.sunset,h.dusk,"rgba(150,70,140,.9)"),A(h.dusk,h.nauticalDusk,"rgba(60,45,130,.9)"),A(h.nauticalDusk,h.night,"rgba(30,20,70,.9)"),a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="center",a.textBaseline="top",a.strokeStyle="rgba(255,255,255,.10)";for(let T=0;T<=24;T+=3){let D=T/24*u;a.beginPath(),a.moveTo(D,L+R),a.lineTo(D,L+R+3),a.stroke(),T%6===0&&T<24&&Ne(a,String(T).padStart(2,"0"),D,L+R+5,0,u)}a.restore();let C=(T,D,z)=>{if(T==null||isNaN(+T))return;let W=H(k(+T),6,u-6);a.save(),a.strokeStyle=z,a.lineWidth=1,a.beginPath(),a.moveTo(W,L-4),a.lineTo(W,L+R),a.stroke(),a.font="600 11.5px 'Chakra Petch', sans-serif",a.fillStyle=z,a.textAlign="center",a.textBaseline="bottom",a.fillText(D,W,L-5),a.restore()};C(h.sunrise,"\u2191","#f2b45a"),C(h.sunset,"\u2193","#f2b45a");let P=H(k(r.cursor),0,u);a.save(),a.strokeStyle=j[1],a.lineWidth=1.5,a.shadowColor=j[1],a.shadowBlur=4,a.beginPath(),a.moveTo(P,L-6),a.lineTo(P,L+R+2),a.stroke(),a.restore()}),y=le(t("s-kp"),(a,u,m,h)=>{let E=r.kpForecast();if(!E.length){M(a,u,m,"no space weather data");return}Qo(a,u,m,h,{rows:E,tf:r.fmt,now:Date.now()})});function M(a,u,m,h){a.save(),a.font="600 11.5px 'Chakra Petch', sans-serif",a.fillStyle=se,a.textAlign="center",a.textBaseline="middle",a.letterSpacing="1.6px",a.fillText(h.toUpperCase(),u/2,m/2),a.restore()}function i(a,u=Date.now()){let m=u,h=6*36e5,E=Qe(new Date(m)).phase;for(let $=0;$<240;$++){m+=h;let w=Qe(new Date(m)).phase;if(E<=a&&w>=a||E>w&&(E<=a||w>=a)){let L=m-h,R=m;for(let A=0;A<28;A++){let C=(L+R)/2,P=Qe(new Date(C)).phase;P<a||P>.9&&a<.1?L=C:R=C}return(L+R)/2}E=w}return null}function c(){let a=r.frame();if(!a)return;let u=r.fmt;t("s-domewhen").textContent=r.atNow?"LIVE":`${u.weekday(r.cursor)} ${u.hm(r.cursor)}`;let m=r.moonTimesFor();t("s-mphase").textContent=Mo(a.moon.phase).toUpperCase();let h=i(.5),E=i(0);t("s-moondl").innerHTML=`
      ${l("Illumination",`${(a.moon.fraction*100).toFixed(1)}%`)}
      ${l("Altitude",`${a.moon.altDeg.toFixed(1)}\xB0 ${me(a.moon.compass)}`)}
      ${l("Distance",`${Math.round(a.moon.distance).toLocaleString()} km`)}
      ${l("Moonrise",m.rise?u.hm(m.rise):m.alwaysUp?"always up":"\u2014")}
      ${l("Moonset",m.set?u.hm(m.set):m.alwaysDown?"never up":"\u2014")}
      ${l("Next full",h?`${u.monthDay(h)} ${u.hm(h)}`:"\u2014")}
      ${l("Next new",E?`${u.monthDay(E)} ${u.hm(E)}`:"\u2014")}
    `;let $=r.sunTimesFor(),w=a.day;t("s-daylen").textContent=w?.daylight?it(w.daylight):"\u2014";let k="\u2014",L=r.days.findIndex(Z=>u.isoDate(Z.t)===u.isoDate(r.cursor));if(L>0&&r.days[L].daylight&&r.days[L-1].daylight){let Z=r.days[L].daylight-r.days[L-1].daylight,Q=Math.abs(Z)/60;k=`${Z>=0?"+":"\u2212"}${Math.floor(Q)}m ${Math.round(Q%1*60)}s vs yesterday`}t("s-sundl").innerHTML=`
      ${l("First light",u.hm($.dawn))}
      ${l("Sunrise",u.hm($.sunrise))}
      ${l("Golden hour ends",u.hm($.goldenHourEnd))}
      ${l("Solar noon",`${u.hm($.solarNoon)} \xB7 ${f().toFixed(1)}\xB0`)}
      ${l("Golden hour",u.hm($.goldenHour))}
      ${l("Sunset",u.hm($.sunset))}
      ${l("Civil dusk",u.hm($.dusk))}
      ${l("Astronomical dark",isNaN(+$.night)?"none tonight":u.hm($.night))}
      ${l("Day length",k)}
    `;let R=r.currentKp(),A=Lt(R);t("s-kpnow").textContent=R!=null?`Kp ${R.toFixed(2)} \xB7 ${A.name}`:"NO DATA";let C=r.space,P=C?.wind?.ok?C.wind.data?.[0]?.proton_speed:null,T=C?.mag?.ok?C.mag.data?.[0]?.bt:null,D=C?.mag?.ok?C.mag.data?.[0]?.bz_gsm:null,z=C?.scales?.ok?C.scales.data?.["0"]:null;t("s-spacedl").innerHTML=`
      ${l("Solar wind",P!=null?`${P} km/s`:"\u2014")}
      ${l("IMF Bt / Bz",T!=null?`${T} / ${D} nT`:"\u2014")}
      ${l("Aurora visible to",A.lat!=null?`${A.lat}\xB0 latitude`:"\u2014")}
      ${l("Your latitude",`${Math.abs(r.loc.lat).toFixed(1)}\xB0 ${r.loc.lat>=0?"N":"S"}`)}
      ${l("Radio / Solar / Geo",z?`R${z.R?.Scale??0} S${z.S?.Scale??0} G${z.G?.Scale??0}`:"\u2014")}
    `;let W=a.air,U=Ut("stargaze",{...a,air:W},{sunAltDeg:a.sun.altDeg,moonFraction:a.moon.fraction,moonUp:a.moon.altDeg>0}),O=U?.score??0,G=O>=75?N.good:O>=50?N.warn:O>=30?N.serious:N.crit;t("s-seenow").textContent=`${O}/100`;let X=r.hours.filter(Z=>Z.t>Date.now()&&Z.t<Date.now()+30*36e5),B=null;for(let Z of X){let Q=r.frame(Z.t);if(!Q||Q.sun.altDeg>-12)continue;let J=Ut("stargaze",Q,{sunAltDeg:Q.sun.altDeg,moonFraction:Q.moon.fraction,moonUp:Q.moon.altDeg>0});(!B||J.score>B.score)&&(B={t:Z.t,score:J.score,limiter:J.limiter})}t("s-seeing").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:5px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${G}">${O}</span>
        <span class="lbl">stargazing now</span>
      </div>
      <div class="meter" style="--ac:${G};margin-bottom:9px"><i style="width:${O}%"></i></div>
      ${(U?.parts||[]).map(Z=>`
        <div class="kv">
          <dt>${Z.name}</dt>
          <dd style="display:flex;align-items:center;gap:6px">
            <span class="meter" style="width:52px;--ac:${Z.value>.7?N.good:Z.value>.4?N.warn:N.crit}">
              <i style="width:${Z.value*100}%"></i></span>
            ${Math.round(Z.value*100)}
          </dd>
        </div>`).join("")}
      <div style="margin-top:8px;font-size:max(.66rem,var(--fs-floor,0px));color:var(--dim);line-height:1.5">
        ${B?`Best hour right now: <b style="color:${ye}">${u.weekday(B.t)} ${u.hm(B.t)}</b> at ${B.score}/100${B.limiter?`, held back by ${B.limiter}`:""}.`:"No astronomical darkness in the next 30 hours."}
      </div>`,S(),s.render(),d.render(),g.render(),v.render(),y.render()}function S(){let a=t("s-tonight");if(!r.loc||!r.hours?.length){a.innerHTML="";return}let u=r.fmt,m=mn(r.hours,r.loc.lat,r.loc.lon,Date.now(),{sunTimes:kt,moonPosition:Je,moonIllumination:Qe,toDeg:ze}),h=fo(m),E=Math.max(4,...m.map(w=>w.goodHours)),$=w=>{let k=h&&w.index===h.index&&w.score>m[0].score,L=w.score>=75?N.good:w.score>=45?N.warn:N.crit;return`
        <div class="tn-n${k?" pick":""}${w.index===0?" now":""}"
             title="${w.goodHours} clear moonless hours of ${w.dark?w.dark.hours.toFixed(1):0} dark">
          <span class="tn-h">${w.dark?`${w.goodHours}h`:"\u2014"}</span>
          <span class="tn-bar"><i style="height:${Math.round(w.goodHours/E*100)}%;background:${L}"></i></span>
          <span class="tn-d">${u.weekday(w.day).slice(0,3).toUpperCase()}</span>
        </div>`};a.innerHTML=`
      <p class="tn-verdict">${oe(pn(m,u))}</p>
      <div class="tn-week">${m.map($).join("")}</div>
      <p class="tn-key">clear, moonless hours per night \xB7 next ${7}</p>`}function f(){let{lat:a,lon:u}=r.loc||{lat:0,lon:0},m=r.sunTimesFor();return!m.solarNoon||isNaN(+m.solarNoon)?0:ze(Ze(m.solarNoon,a,u).altitude)}let l=(a,u)=>`<div class="kv"><dt>${a}</dt><dd>${u}</dd></div>`;async function p(){if(r.view==="sky")try{let a=await ce.iss();if(a.pos?.ok){let u=a.pos.data,m=r.loc||{lat:0,lon:0};o={...pt(m.lat,m.lon,u.latitude,u.longitude,u.altitude),lat:u.latitude,lon:u.longitude,visibility:u.visibility},s.render()}}catch{}}return setInterval(p,8e3),{update:c,onShow(){p(),s.render(),d.render(),g.render(),v.render(),y.render()}}}var vn=[{key:"pm25",label:"PM2.5",unit:"\xB5g/m\xB3",ref:35,who:15,note:"fine particulate \u2014 lungs and bloodstream"},{key:"pm10",label:"PM10",unit:"\xB5g/m\xB3",ref:150,who:45,note:"coarse dust and pollen fragments"},{key:"o3",label:"Ozone",unit:"\xB5g/m\xB3",ref:140,who:100,note:"photochemical smog, peaks mid-afternoon"},{key:"no2",label:"NO\u2082",unit:"\xB5g/m\xB3",ref:200,who:25,note:"traffic and combustion"},{key:"so2",label:"SO\u2082",unit:"\xB5g/m\xB3",ref:350,who:40,note:"industry and shipping"},{key:"co",label:"CO",unit:"\xB5g/m\xB3",ref:1e4,who:4e3,note:"incomplete combustion"}],ma=["I very fair","II fair","III medium","IV olive","V brown","VI dark"];function yn(e){e.className="view airview",e.innerHTML=`
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
  `;let t=i=>e.querySelector("#"+i),o=le(t("a-gauge"),(i,c,S)=>{let l=r.frame()?.air?.aqi??r.airNow?.aqi,p=_e(l),a=Math.min(c,S)/2-22;Ke(i,c/2,S/2-4,Math.max(18,a),{value:l,min:0,max:300,color:p.color,label:"",unit:"US AQI",bands:[{from:0,to:50,color:N.good},{from:50,to:100,color:N.warn},{from:100,to:150,color:N.serious},{from:150,to:200,color:N.crit},{from:200,to:300,color:"#c89af5"}],ticks:6})}),n=le(t("a-uv"),(i,c,S,f)=>{let l=r.fmt.isoDate(r.cursor),p=r.hours.filter(w=>r.fmt.isoDate(w.t)===l);if(p.length<2)return;let a={l:2,r:24,t:12,b:14},u={x:a.l,y:a.t,w:c-a.l-a.r,h:S-a.t-a.b},m=w=>u.y+u.h-H(w,0,12)/12*u.h;for(let[w,k,L]of[[3,N.good,"LOW"],[6,N.warn,"MOD"],[8,N.serious,"HIGH"],[11,N.crit,"V.HIGH"]])i.save(),i.strokeStyle=V(k,.3),i.setLineDash([3,3]),i.lineWidth=1,i.beginPath(),i.moveTo(u.x,m(w)),i.lineTo(u.x+u.w,m(w)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=V(k,.8),i.textAlign="right",i.textBaseline="bottom",Ce(i,L,u.x+u.w-2,m(w)-1),i.restore();let h=p.length,E=Math.max(2,u.w/h-1.5);p.forEach((w,k)=>{let L=w.uv??0;if(L<=.03)return;let R=qe(L).color;je(i,u.x+k*u.w/h,m(L),E,u.y+u.h,V(R,.85))});let $=p.map(w=>[u.x+p.indexOf(w)*u.w/h+E/2,m(w.uvClear??0)]);i.save(),i.setLineDash([3,2]),i.strokeStyle=V(ye,.35),i.lineWidth=1,i.beginPath(),$.forEach(([w,k],L)=>L?i.lineTo(w,k):i.moveTo(w,k)),i.stroke(),i.restore(),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=se,i.textAlign="center",i.textBaseline="top",p.forEach((w,k)=>{let L=r.fmt.hourOfDay(w.t);Math.round(L)%4||Math.abs(L-Math.round(L))>.02||Ne(i,r.fmt.hm(w.t),u.x+k*u.w/h+E/2,S-a.b+3,0,c)}),i.restore(),Se(i,u.x+2,1,"uv index today \xB7 dashed = clear sky")}),s=le(t("a-fc"),(i,c,S,f)=>{let l=r.air.filter(L=>L.t>=Date.now()-216e5&&L.t<=Date.now()+3456e5);if(l.length<3){d(i,c,S,"no air quality forecast");return}let p={l:4,r:30,t:16,b:18},a={x:p.l,y:p.t,w:c-p.l-p.r,h:S-p.t-p.b},u=Math.max(110,Math.max(...l.map(L=>L.aqi??0))*1.15),m=L=>a.x+(L-l[0].t)/(l.at(-1).t-l[0].t)*a.w,h=L=>a.y+a.h-H(L,0,u)/u*a.h;for(let[L,R,A]of[[50,N.good,"GOOD"],[100,N.warn,"MODERATE"],[150,N.serious,"SENSITIVE"]])L>u||(i.save(),i.strokeStyle=V(R,.28),i.setLineDash([4,3]),i.beginPath(),i.moveTo(a.x,h(L)),i.lineTo(a.x+a.w,h(L)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=V(R,.85),i.textAlign="right",i.textBaseline="bottom",Ce(i,A,a.x+a.w-2,h(L)-2),i.restore());let E=l.length,$=Math.max(1,a.w/E-.5);l.forEach((L,R)=>{L.aqi!=null&&je(i,a.x+R*a.w/E,h(L.aqi),$,a.y+a.h,V(_e(L.aqi).color,.8),2)}),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=se,i.textAlign="center",i.textBaseline="top",i.strokeStyle="rgba(255,255,255,.07)";let w="";l.forEach((L,R)=>{let A=r.fmt.isoDate(L.t);if(A===w)return;w=A;let C=a.x+R*a.w/E;i.beginPath(),i.moveTo(C,a.y),i.lineTo(C,a.y+a.h),i.stroke(),C<a.x+a.w-20&&i.fillText(r.fmt.weekday(L.t).toUpperCase(),C+16,S-p.b+4)}),i.restore();let k=m(Date.now());if(k>a.x&&k<a.x+a.w&&(i.save(),i.strokeStyle=V(N.good,.85),i.setLineDash([3,3]),i.beginPath(),i.moveTo(k,a.y),i.lineTo(k,a.y+a.h),i.stroke(),i.restore()),Se(i,a.x+2,3,"us aqi \u2014 next 4 days"),f&&f.x>a.x&&f.x<a.x+a.w){let L=H(Math.round((f.x-a.x)/a.w*(E-1)),0,E-1),R=l[L],A=_e(R.aqi);i.save(),i.strokeStyle="rgba(255,255,255,.3)",i.beginPath(),i.moveTo(m(R.t),a.y),i.lineTo(m(R.t),a.y+a.h),i.stroke(),i.restore(),tt(i,m(R.t),f.y,[`${r.fmt.weekday(R.t)} ${r.fmt.hm(R.t)}|`,`AQI|${Math.round(R.aqi??0)}`,`CATEGORY|${A.name}`,`PM2.5|${R.pm25?.toFixed(1)??"--"}`,`OZONE|${R.o3?.toFixed(0)??"--"}`],c,S,A.color,{pin:f.coarse})}});function d(i,c,S,f){i.save(),i.font="600 11.5px 'Chakra Petch', sans-serif",i.fillStyle=se,i.textAlign="center",i.textBaseline="middle",i.letterSpacing="1.6px",i.fillText(f.toUpperCase(),c/2,S/2),i.restore()}function g(){let i=r.frame();if(!i)return;let c=i.air||r.airNow,S=c?.aqi,f=_e(S);t("a-cat").textContent=f.name,t("a-cat").style.color=f.color,t("a-note").textContent=y(S);let l=null;if(c)for(let E of vn){let $=c[E.key];if($==null)continue;let w=$/E.ref;(!l||w>l.frac)&&(l={...E,value:$,frac:w})}t("a-dl").innerHTML=`
      ${M("Dominant",l?`${l.label} ${l.value.toFixed(1)} ${l.unit}`:"\u2014")}
      ${M("PM2.5",c?.pm25!=null?`${c.pm25.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
      ${M("Ozone",c?.o3!=null?`${c.o3.toFixed(0)} \xB5g/m\xB3`:"\u2014")}
      ${M("Aerosol depth",c?.aod!=null?c.aod.toFixed(3):"\u2014")}
      ${M("Dust",c?.dust!=null?`${c.dust.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
    `,t("a-poll").innerHTML=vn.map(E=>{let $=c?.[E.key];if($==null)return"";let w=H($/E.ref*100,0,100),k=$>E.who,L=w>100?N.crit:w>66?N.serious:w>33?N.warn:N.good;return`
        <div style="margin-bottom:7px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
            <span class="lbl" style="color:var(--dim)">${E.label}</span>
            <span class="num" style="font-size:max(.72rem,var(--fs-floor,0px));color:${L}">${$.toFixed($<10?1:0)}<span style="color:var(--faint);font-size:max(.85em,var(--fs-floor,0px))"> ${E.unit}</span></span>
          </div>
          <div class="meter" style="--ac:${L};margin:3px 0 2px;position:relative">
            <i style="width:${w}%"></i>
            <span style="position:absolute;left:${H(E.who/E.ref*100,0,100)}%;top:-2px;bottom:-2px;width:1px;background:rgba(255,255,255,.5)"></span>
          </div>
          <div style="font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint)">${E.note}${k?' \xB7 <b style="color:'+N.serious+'">above WHO guideline</b>':""}</div>
        </div>`}).join("")||'<div class="nodata">no pollutant data</div>',v();let p=i.uv;t("a-uvnow").textContent=p!=null?`${p.toFixed(1)} \xB7 ${qe(p).name}`:"\u2014";let a=i.day?.uvMax;t("a-burn").innerHTML=p>0||a>0?`
      <div class="lbl" style="margin-bottom:4px">time to burn at today's peak (UV ${(a??p).toFixed(1)})</div>
      <div class="burngrid">
        ${ma.map((E,$)=>{let w=At(a??p,$+1),k=w==null?pe:w<15?N.crit:w<30?N.serious:w<60?N.warn:N.good;return`<div><span class="lbl">${E}</span><b style="color:${k}">${w==null?"\u2014":w+"m"}</b></div>`}).join("")}
      </div>`:'<div class="nodata">no uv exposure right now</div>';let u=Ve(i.dew);t("a-cmf").textContent=u.name;let m=i.feels,h=m!=null&&i.temp!=null?m-i.temp:null;t("a-comfort").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:6px">
        <span class="num" style="font-size:1.7rem;font-weight:700;color:${u.color}">${Y.temp(i.dew)}</span>
        <span class="lbl">dew point</span>
      </div>
      <div class="dewstrip">
        ${[[-99,30,"VERY DRY"],[30,45,"DRY"],[45,55,"COMFORTABLE"],[55,60,"STICKY"],[60,65,"HUMID"],[65,70,"OPPRESSIVE"],[70,99,"MISERABLE"]].map(([$,w,k])=>`<i class="${i.dew!=null&&i.dew>=$&&i.dew<w?"on":""}" style="--c:${Ve(($+w)/2).color}" title="${k}"></i>`).join("")}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:max(.46rem,var(--fs-floor,0px));color:var(--faint);letter-spacing:.08em;margin-top:2px">
        <span>DRY</span><span>COMFORTABLE</span><span>OPPRESSIVE</span>
      </div>
      <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin:6px 0 8px">${u.note}</div>
      <dl style="margin:0">
        ${M("Air temperature",Y.temp(i.temp))}
        ${M("Feels like",`${Y.temp(i.feels)}${h!=null&&Math.abs(h)>=1?` (${Y.signed(h,0)}\xB0)`:""}`)}
        ${M("Relative humidity",Y.pct(i.rh))}
        ${M("Wet bulb",Y.temp(i.wetbulb))}
        ${M("Vapour deficit",i.vpd!=null?`${i.vpd.toFixed(2)} kPa`:"\u2014")}
      </dl>
      <div style="font-size:max(.56rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Dew point predicts how the air feels far better than relative humidity,
        which only tells you how close the air is to saturation at its own temperature.
      </div>`,o.render(),n.render(),s.render()}function v(){let i=r.pollen,c=r.fmt;if(!i||i.source==="none"){let l=r.frame()?.air,p=l&&["grass","birch","alder","ragweed","olive","mugwort"].map(a=>[a,l[a]]).filter(([,a])=>a!=null);if(p?.length){t("a-polsrc").textContent="CAMS EUROPE",t("a-pollen").innerHTML=p.map(([a,u])=>`
          <div class="kv"><dt>${a}</dt><dd>${u.toFixed(1)} grains/m\xB3</dd></div>`).join("");return}t("a-polsrc").textContent="NO COVERAGE",t("a-pollen").innerHTML=`<div class="nodata">
        pollen data unavailable here<br><span style="color:var(--faint);text-transform:none;letter-spacing:0">
        ${oe(i?.reason||"no source covers this location")}</span></div>`;return}let S=gt(i.index),f=i.yesterday!=null&&i.index!=null?i.index-i.yesterday:null;t("a-polsrc").textContent=i.source.toUpperCase(),t("a-pollen").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${S.color}">${i.index?.toFixed(1)??"--"}</span>
        <div>
          <div class="chip" style="--ac:${S.color}">${S.name}</div>
          <div style="font-size:max(.54rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">of 12${f!=null?` \xB7 ${Y.signed(f,1)} vs yesterday`:""}</div>
        </div>
      </div>
      <div class="meter" style="--ac:${S.color};margin:7px 0 9px"><i style="width:${H(i.index/12*100,0,100)}%"></i></div>
      ${i.triggers?.length?`
        <div class="lbl" style="margin-bottom:4px">today's triggers</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px">
          ${i.triggers.map(l=>`<span class="chip" style="--ac:var(--lm)">${oe(l.name)}</span>`).join("")}
        </div>`:""}
      ${i.forecast?.length?`
        <div class="lbl" style="margin-bottom:4px">5-day outlook</div>
        <div class="pollen-fc">
          ${i.forecast.map(l=>{let p=gt(l.index);return`<div>
              <span class="bar" style="height:${H(l.index/12*100,4,100)}%;--c:${p.color}"></span>
              <b>${l.index.toFixed(1)}</b>
              <span>${c.weekday(Date.parse(l.date))}</span>
            </div>`}).join("")}
        </div>`:""}`}function y(i){return i==null?"no measurement available":i<=50?"Air quality is satisfactory. No restrictions.":i<=100?"Acceptable. Unusually sensitive people may want to limit long outdoor exertion.":i<=150?"Sensitive groups \u2014 asthma, heart or lung conditions, children, older adults \u2014 should reduce prolonged exertion.":i<=200?"Everyone may begin to feel effects. Limit prolonged outdoor exertion.":i<=300?"Health alert. Avoid outdoor exertion; keep windows closed.":"Emergency conditions. Remain indoors with filtration if possible."}let M=(i,c)=>`<div class="kv"><dt>${i}</dt><dd>${c}</dd></div>`;return{update:g,onShow(){o.render(),n.render(),s.render()}}}function wn(e){e.className="view dataview",e.innerHTML=`
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
  `;let t=f=>e.querySelector("#"+f),o=f=>To(f,r.tz);function n(){let f=r.fmt.isoDate(Date.now()),l=r.days.find(p=>r.fmt.isoDate(p.t)===f);return l?l.t:Date.now()-12*36e5}function s(f,l,p,a){f.save(),f.font="600 11.5px 'Chakra Petch', sans-serif",f.fillStyle=se,f.textAlign="center",f.textBaseline="middle",f.letterSpacing="1.6px",f.fillText(a.toUpperCase()+" \u2026",l/2,p/2),f.restore()}let d=le(t("d2-clim"),(f,l,p,a)=>{if(!r.climate){s(f,l,p,"loading 30-year archive");return}Jo(f,l,p,a,{days:r.days.filter(u=>u.t>=n()),climate:r.climate,tf:r.fmt,doyOf:o})}),g=le(t("d2-spread"),(f,l,p,a)=>{if(!r.models){s(f,l,p,"loading model ensemble");return}Zo(f,l,p,a,{rows:r.models.rows,tf:r.fmt,now:Date.now()})}),v=le(t("d2-meteo"),(f,l,p,a)=>{Ft(f,l,p,a,{hours:r.hours,days:r.days,tf:r.fmt,span:{lo:r.cursor-24*36e5,hi:r.cursor+96*36e5},cursor:r.cursor,now:Date.now(),panels:["pressure","cloud","uv","cape"]})},{onPick:({x:f,w:l})=>{let p=r.cursor-864e5,a=r.cursor+96*36e5;r.playing=!1,r.scrubTo(p+(f-4)/(l-34)*(a-p))}}),y=le(t("d2-trend"),(f,l,p,a)=>{let u=r.climate?.annual;if(!u?.length){s(f,l,p,"loading climate record");return}let m={l:4,r:34,t:16,b:18},h={x:m.l,y:m.t,w:l-m.l-m.r,h:p-m.t-m.b};if(h.w<40||h.h<30)return;let E=u.map(x=>x.mean),$=Math.min(...E)-.4,w=Math.max(...E)+.4,k=x=>h.x+x/(u.length-1)*h.w,L=x=>h.y+h.h-(x-$)/(w-$)*h.h;Ie(f,h,Ue($,w,We(h.h,3)).map(x=>({v:x,y:L(x)})),x=>`${x.toFixed(1)}\xB0`);let R=E.reduce((x,fe)=>x+fe,0)/E.length,A=Math.max(2,h.w/u.length-2);u.forEach((x,fe)=>{let Ae=x.mean-R,de=Ae>=0?Be("#8d9aab","#f2b45a",H(Math.abs(Ae)/1.6,0,1)):Be("#8d9aab","#7fb2f0",H(Math.abs(Ae)/1.6,0,1)),ve=L(R),b=L(x.mean);f.fillStyle=V(de,.9),f.fillRect(k(fe)-A/2,Math.min(ve,b),A,Math.max(1.5,Math.abs(b-ve)))});let C=u.length,P=u.reduce((x,fe)=>x+fe.year,0)/C,T=R,D=0,z=0;for(let x of u)D+=(x.year-P)*(x.mean-T),z+=(x.year-P)**2;let W=z?D/z:0,U=u.map((x,fe)=>[k(fe),L(T+W*(x.year-P))]);f.save(),f.setLineDash([5,3]),Te(f,U,W>=0?"#f2b45a":"#7fb2f0",{width:2,glow:10}),f.restore(),f.save(),f.font="500 11.5px 'JetBrains Mono', monospace",f.fillStyle=se,f.textAlign="center",f.textBaseline="top";let O=5*Nt(Math.ceil(u.length/5),h.w,f.measureText("2020").width);u.forEach((x,fe)=>{x.year%O||Ne(f,String(x.year),k(fe),p-m.b+4,0,l)}),f.restore(),f.save(),f.font="600 11.5px 'Chakra Petch', sans-serif",f.letterSpacing="1.2px";let G=`TREND ${W>=0?"+":"\u2212"}${Math.abs(W*10).toFixed(2)}\xB0F / DECADE`,X=f.measureText(G).width;f.fillStyle=W>=0?"#f2b45a":"#7fb2f0",f.textAlign="right",f.textBaseline="top",f.fillText(G,h.x+h.w,3),f.restore(),f.save(),f.font=we,f.letterSpacing="1.4px";let B="annual mean temperature \xB0F",Z="annual mean \xB0F",Q=x=>f.measureText(x.toUpperCase()).width,J=Q(B)+X+14<=h.w?B:Q(Z)+X+14<=h.w?Z:null;if(f.restore(),J&&Se(f,h.x+2,3,J),a&&a.x>h.x&&a.x<h.x+h.w){let x=H(Math.round((a.x-h.x)/h.w*(u.length-1)),0,u.length-1),fe=u[x];f.save(),f.fillStyle="rgba(22,33,47,.94)",f.strokeStyle=V(j[0],.5);let Ae=`${fe.year}  ${fe.mean.toFixed(2)}\xB0F  ${fe.mean-R>=0?"+":"\u2212"}${Math.abs(fe.mean-R).toFixed(2)} vs period mean`;f.font="500 11.5px 'JetBrains Mono', monospace";let de=f.measureText(Ae).width+14,ve=H(k(x)-de/2,4,Math.max(4,l-de-4)),b=a.coarse&&a.y<p/2?h.y+h.h-20:h.y+2;f.beginPath(),f.rect(ve,b,de,18),f.fill(),f.stroke(),f.fillStyle=ye,f.textAlign="left",f.textBaseline="middle",f.fillText(Ae,ve+7,b+9),f.restore()}});function M(){let f=r.fmt,l=r.climate,p=r.dayFor(r.cursor),a=l?.doy?.[o(r.cursor)];if(t("d2-yrs").textContent=l?`${l.years} YEARS \xB7 ${l.start.slice(0,4)}\u2013${l.end.slice(0,4)}`:"\u2014",a&&p){let C=p.tmax-a.normalHigh,P=p.tmin-(a.normalLow??p.tmin),T=H((p.tmax-a.normalHigh)/Math.max(.1,a.recordHigh-a.normalHigh)*100,0,100);t("d2-rec").innerHTML=`
        <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin-bottom:7px">
          ${f.weekday(r.cursor)} ${f.monthDay(r.cursor)} \xB7 forecast against every
          ${f.monthDay(r.cursor)} since ${l.start.slice(0,4)}
        </div>
        <dl style="margin:0">
          ${S("Forecast high",Y.temp(p.tmax),C>=0?"#f2b45a":"#7fb2f0")}
          ${c("Normal high",`${Y.temp(a.normalHigh)}  (${Y.signed(C)}\xB0)`)}
          ${S("Record high",`${Y.temp(a.recordHigh)} in ${a.recordHighYear}`,p.tmax>=a.recordHigh?N.crit:pe)}
          ${c("Forecast low",Y.temp(p.tmin))}
          ${c("Normal low",`${Y.temp(a.normalLow)}  (${Y.signed(P)}\xB0)`)}
          ${S("Record low",`${Y.temp(a.recordLow)} in ${a.recordLowYear}`,p.tmin<=a.recordLow?j[4]:pe)}
        </dl>
        <div class="lbl" style="margin:9px 0 3px">high, normal \u2192 record</div>
        <div class="meter" style="--ac:${T>85?N.crit:N.serious}">
          <i style="width:${T}%"></i></div>
        <div style="display:flex;justify-content:space-between;font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">
          <span>${Y.temp(a.normalHigh)} normal</span><span>${Y.temp(a.recordHigh)} record</span>
        </div>
        <dl style="margin:9px 0 0">
          ${c("Historically wet",`${Math.round(a.wetFrac*100)}% of years`)}
          ${c("Mean precip",`${a.meanPrecip.toFixed(3)} in`)}
          ${c("Forecast precip",`${(p.precip??0).toFixed(2)} in`)}
        </dl>`}else t("d2-rec").innerHTML='<div class="nodata">climate archive loading\u2026</div>';let u=Date.now(),m=r.hours.filter(C=>C.t<=u&&C.t>=u-720*36e5),h=0,E=0,$=0;for(let C of r.days){if(C.tmax==null||C.tmin==null)continue;let P=(C.tmax+C.tmin)/2;C.t>u||(h+=Math.max(0,65-P),E+=Math.max(0,P-65),$+=Math.max(0,Math.min(P,86)-50))}let w=r.models?.rows?.find(C=>C.t>=u),k=w?w.spread<2?["HIGH",N.good]:w.spread<5?["MODERATE",N.warn]:w.spread<9?["LOW",N.serious]:["VERY LOW",N.crit]:null,L=r.models?.rows?.find(C=>C.t>=u+168*36e5),R=r.days.filter(C=>C.t>u).reduce((C,P)=>C+(P.precip??0),0),A=r.days.filter(C=>C.t>u&&(C.precip??0)>=.01).length;t("d2-derived").innerHTML=`
      <dl style="margin:0">
        ${c("Pressure now",`${Y.pressure(r.frame()?.pressure)} inHg`)}
        ${c("3h tendency",i())}
        ${k?S("Forecast confidence",`${k[0]} \xB7 \xB1${(w.spread/2).toFixed(1)}\xB0`,k[1]):""}
        ${L?c("Day-7 model spread",`${L.spread.toFixed(1)}\xB0`):""}
        ${c("16-day precip total",`${R.toFixed(2)} in`)}
        ${c("Wet days ahead",`${A} of ${r.days.filter(C=>C.t>u).length}`)}
      </dl>
      <div class="lbl" style="margin:9px 0 3px">degree days, window shown</div>
      <dl style="margin:0">
        ${c("Heating (base 65\xB0F)",Math.round(h))}
        ${c("Cooling (base 65\xB0F)",Math.round(E))}
        ${c("Growing (50/86\xB0F)",Math.round($))}
      </dl>
      <div style="font-size:max(.55rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Degree days accumulate how far each day's mean sits from a base
        temperature \u2014 the standard proxy for heating load, cooling load and
        crop development.
      </div>`,d.render(),g.render(),y.render(),v.render()}function i(){let f=r.cursor,l=r.hours.find(m=>m.t>=f-3*36e5),p=r.hours.find(m=>m.t>=f);if(!l?.pressure||!p?.pressure)return"\u2014";let a=(p.pressure-l.pressure)*.029529983,u=Math.abs(a)<.02?"steady":Math.abs(a)<.06?"slow":Math.abs(a)<.12?"moderate":"rapid";return`${Y.signed(a,3)} inHg \xB7 ${a>0?"rising":a<0?"falling":""} ${u}`.trim()}let c=(f,l)=>`<div class="kv"><dt>${f}</dt><dd>${l}</dd></div>`,S=(f,l,p)=>`<div class="kv"><dt>${f}</dt><dd style="color:${p}">${l}</dd></div>`;return{update:M,onShow(){d.render(),g.render(),y.render(),v.render()}}}var at=null,pa=()=>at?Promise.resolve(at):import("./sats.OZS22OPN.js").then(e=>at=e),bn=1852,ga=1e4,Mn=24,Sn="atmos.sats.v1",va=5e3,$n=2,kn=(e,t)=>t?se:Be("#f07aa6","#3fd0d8",H((e??0)/38e3,0,1));function Tn(e){e.className="view overheadview",e.innerHTML=`
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
  `;let t=b=>e.querySelector("#"+b),o=[],n=0,s=null,d=!1,g=null,v=null,y=null,M=null,i=!1,c=Object.fromEntries(Oe.map(b=>[b.key,b.on]));try{let b=JSON.parse(localStorage.getItem(Sn)||"null");if(b&&typeof b=="object")for(let I of Oe)typeof b[I.key]=="boolean"&&(c[I.key]=b[I.key])}catch{}let S={},f=[],l=null,p=0,a=null,u=[],m=()=>r.loc||{lat:0,lon:0},h=new ut(t("o-map"),{center:[m().lat,m().lon],zoom:9,minZoom:5,maxZoom:12,onTap:b=>E(b)});h.layers=[{name:"base",url:(b,I,q)=>`${ft}/World_Dark_Gray_Base/MapServer/tile/${b}/${q}/${I}`,filter:Kt,opacity:1},{name:"labels",url:(b,I,q)=>`${ft}/World_Dark_Gray_Reference/MapServer/tile/${b}/${q}/${I}`,filter:Yt,opacity:.85}],h.overlays.push((b,I)=>{let q=m(),[F,_]=I.project(q.lat,q.lon),K=156543.03392*Math.cos(I.lat*Math.PI/180)/Math.pow(2,I.zoom);b.save(),b.strokeStyle="rgba(63,208,216,.13)",b.setLineDash([2,4]),b.lineWidth=1,b.font="500 11.5px 'JetBrains Mono', monospace",b.fillStyle=j[0],b.textAlign="center",b.textBaseline="bottom";for(let ee of[10,20,40]){let te=ee*bn/K;te<24||te>Math.max(I.w,I.h)||(b.beginPath(),b.arc(F,_,te,0,Math.PI*2),b.stroke(),Ce(b,`${ee} NM`,F,_-te-2))}b.restore();for(let ee of i?[]:o){let[te,ne]=I.project(ee.lat,ee.lon);if(te<-20||ne<-20||te>I.w+20||ne>I.h+20)continue;let he=ee.hex===g,$e=kn(ee.alt,ee.gnd);if(he){let De=(ee.gs??0)/60;if(De>.1&&ee.trk!=null){let wo=De*bn/K,bo=(ee.trk-90)*Math.PI/180;b.save(),b.strokeStyle=V($e,.6),b.setLineDash([3,3]),b.lineWidth=1.2,b.beginPath(),b.moveTo(te,ne),b.lineTo(te+Math.cos(bo)*wo,ne+Math.sin(bo)*wo),b.stroke(),b.restore()}b.save(),b.strokeStyle=$e,b.lineWidth=1.5,b.shadowColor=$e,b.shadowBlur=5,b.beginPath(),b.arc(te,ne,13,0,Math.PI*2),b.stroke(),b.restore()}if(b.save(),b.translate(te,ne),b.rotate((ee.trk??0)*Math.PI/180),b.fillStyle=$e,he&&(b.shadowColor=$e,b.shadowBlur=4),b.beginPath(),b.moveTo(0,-6.5),b.lineTo(4.5,5),b.lineTo(0,2.4),b.lineTo(-4.5,5),b.closePath(),b.fill(),b.restore(),he&&ee.cs){b.save(),b.font="600 11.5px 'Chakra Petch', sans-serif",b.letterSpacing="1.2px",b.textAlign="left",b.textBaseline="middle";let De=b.measureText(ee.cs).width+10;b.fillStyle="rgba(22,33,47,.88)",b.fillRect(te+16,ne-7,De,14),b.fillStyle=$e,b.fillText(ee.cs,te+21,ne),b.restore()}}i&&B(b,I),r.loc&&xt(b,F,_,"#f07aa6",null),Zt(b,I,12,I.h-12)});function E(b){if(i){let F=null,_=Mn;for(let K of f){let[ee,te]=h.project(K.p.lat,K.p.lon),ne=Math.hypot(ee-b.x,te-b.y);ne<_&&(_=ne,F=K)}Z(F?F.sat.id:null);return}let I=null,q=Mn;for(let F of o){let[_,K]=h.project(F.lat,F.lon),ee=Math.hypot(_-b.x,K-b.y);ee<q&&(q=ee,I=F)}$(I?I.hex:null)}function $(b){if(g===b||(g=b,v=null,R(),h.invalidate(),!b))return;let I=o.find(q=>q.hex===b);I&&ce.flight(I.cs||"",I.hex||"").then(q=>{g===b&&(v=q,R())}).catch(()=>{})}let w=(b,I)=>`<div class="kv"><dt>${b}</dt><dd>${I}</dd></div>`,k=b=>b==null?"\u2014":`${Math.round(b).toLocaleString()} ft`;function L(b,I){let q=m(),F=Math.PI/180,_=(I-q.lon)*F,K=Math.sin(_)*Math.cos(b*F),ee=Math.cos(q.lat*F)*Math.sin(b*F)-Math.sin(q.lat*F)*Math.cos(b*F)*Math.cos(_);return(ze(Math.atan2(K,ee))+360)%360}function R(){if(i){J();return}let b=o.find(te=>te.hex===g);if(!b){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap an aircraft on the map, or a row in NEAREST.</p>';return}t("o-cs").textContent=b.cs||b.reg||b.hex.toUpperCase();let I=b.vs==null||Math.abs(b.vs)<100?"level":b.vs>0?`climbing ${Math.round(b.vs).toLocaleString()} ft/min`:`descending ${Math.abs(Math.round(b.vs)).toLocaleString()} ft/min`,q=L(b.lat,b.lon),F=[],_=v;_?.airline?F.push(w("Operator",oe(_.airline))):_?.aircraft?.owner&&F.push(w("Operator",oe(_.aircraft.owner)));let K=_?.aircraft?.manufacturer&&_?.aircraft?.type?`${_.aircraft.manufacturer} ${_.aircraft.type}`:b.type;if(K&&F.push(w("Aircraft",oe(K))),b.reg&&F.push(w("Registration",oe(b.reg))),_?.origin||_?.destination){let te=ne=>ne?`${oe(ne.iata||"??")} <span class="dim">${oe(ne.city||"")}</span>`:"\u2014";F.push(w("From",te(_.origin))),F.push(w("To",te(_.destination)))}F.push(w("Altitude",b.gnd?"on the ground":k(b.alt))),F.push(w("Motion",`${b.gs==null?"\u2014":`${Math.round(b.gs)} kt`} \xB7 ${I}`)),F.push(w("Heading",b.trk==null?"\u2014":`${Math.round(b.trk)}\xB0 ${me(b.trk)}`)),F.push(w("From you",`${(b.dst??0).toFixed(1)} nm ${me(q)}`));let ee=_&&!_.origin&&b.cs?'<p class="hint">No published route \u2014 usually private or general aviation.</p>':_?.origin?'<p class="hint">Route is by callsign, which airlines reuse day to day.</p>':"";t("o-sel").innerHTML=F.join("")+ee}function A(){if(i){x();return}t("o-neartitle").textContent="NEAREST";let b=o.filter(I=>!I.gnd).slice(0,8);if(t("o-src").textContent=s?s.toUpperCase():"NO FEED",!b.length){t("o-near").innerHTML=d?'<p class="hint">The aircraft feeds are not answering. Trying again shortly.</p>':'<p class="hint">Nothing in the air within range.</p>';return}t("o-near").innerHTML='<div class="oh-head"><span>callsign</span><span>type</span><span>range</span><span>alt</span></div>'+b.map(I=>`
      <button class="oh-row" data-hex="${oe(I.hex)}" aria-pressed="${I.hex===g}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${kn(I.alt,I.gnd)} 80%, var(--ink))">${oe(I.cs||I.reg||I.hex)}</span>
        <span class="oh-t">${oe(I.type||"")}</span>
        <span class="oh-d">${(I.dst??0).toFixed(1)} nm</span>
        <span class="oh-a">${I.alt==null?"\u2014":`${(I.alt/1e3).toFixed(1)}k`}</span>
      </button>`).join("");for(let I of t("o-near").querySelectorAll(".oh-row"))I.addEventListener("click",()=>{$(I.dataset.hex),A()})}function C(){let b=m(),I=new Date(r.cursor),q=Ze(I,b.lat,b.lon),F=Je(I,b.lat,b.lon),_=(te,ne,he,$e)=>{let De=ne>0;return`<div class="kv"><dt style="color:${$e}">${te}</dt><dd>${De?`${ne.toFixed(0)}\xB0 up, ${me(he)}`:'<span class="dim">below the horizon</span>'}</dd></div>`},K=[_("Sun",ze(q.altitude),Fe(q.azimuth),"#f2b45a"),_("Moon",ze(F.altitude),Fe(F.azimuth),"#7fb2f0")];K.push(y&&y.alt>0?_("ISS",y.alt,y.az,"#8fdc6a"):`<div class="kv"><dt style="color:#8fdc6a">ISS</dt><dd><span class="dim">${y?`below the horizon, ${y.range.toLocaleString()} km away`:"no fix"}</span></dd></div>`);let ee=Math.abs(r.cursor-Date.now());t("o-lookwhen").textContent=ee<6*6e4?"NOW":`${r.fmt.weekday(r.cursor)} ${r.fmt.hm(r.cursor)}`,t("o-sky").innerHTML=K.join("")+'<p class="hint">Aircraft positions from adsb.lol under ODbL; routes and airframes from adsbdb. Both are run by volunteers.</p>'}function P(){if(i){fe();return}let b=o.filter(q=>!q.gnd).length;t("o-count").textContent=d?"AIRCRAFT FEEDS NOT ANSWERING":`${b} AIRCRAFT`;let I=n?Math.round((Date.now()-n)/1e3):null;t("o-age").textContent=I==null?"\u2014":I<20?"LIVE":`${I}s AGO`}async function T(){if(!(i||r.view!=="overhead"||!r.loc))try{let b=await ce.aircraft(r.loc.lat,r.loc.lon,60);o=b.aircraft||[],n=b.at||Date.now(),s=b.source,d=b.source==null,g&&!o.some(I=>I.hex===g)&&$(null),P(),A(),R(),h.invalidate()}catch{}}async function D(){if(!(r.view!=="overhead"||!r.loc))try{let b=await ce.iss();if(b.pos?.ok){let I=b.pos.data;y=pt(r.loc.lat,r.loc.lon,I.latitude,I.longitude,I.altitude),C()}}catch{}}let z=b=>Oe.find(I=>I.key===b),W=b=>`${b.lat.toFixed(1)},${b.lon.toFixed(1)}`,U=b=>b<1?`${Math.max(1,Math.round(b*60))} min`:b<48?`${Math.round(b)} h`:`${Math.round(b/24)} days`;async function O(b){let I=S[b.key];if(!(I&&(I.state==="ok"||I.state==="loading"))){S[b.key]={state:"loading",sats:[],fetched:null};try{await pa();let q=new Map,F=1/0;for(let _ of b.groups){let K=await fetch(new URL(`/sats/${_}.json`,location.origin));if(!K.ok)throw new Error(`${_} -> ${K.status}`);let ee=await K.json(),te=Date.parse(ee.fetched);Number.isFinite(te)&&(F=Math.min(F,te));for(let ne of at.prepare(ee.records,b.key))q.set(ne.id,ne)}if(!q.size)throw new Error("empty");S[b.key]={state:"ok",sats:[...q.values()],fetched:Number.isFinite(F)?F:null}}catch{S[b.key]={state:"fail",sats:[],fetched:null}}X(!0),Ae(),A(),R(),P(),h.invalidate()}}let G={};function X(b){if(!i)return;let I=r.cursor,q=m(),F=[];for(let K of Oe){let ee=S[K.key];if(!c[K.key]||!ee||ee.state!=="ok")continue;let te=G[K.key],ne=K.key==="starlink";if(!b&&ne&&te&&Math.abs(I-te.at)<va){F.push(...te.list);continue}let he=[];for(let $e of ee.sats){let De=at.positionAt($e,I);De&&he.push({sat:$e,p:De,cat:K,look:pt(q.lat,q.lon,De.lat,De.lon,De.altKm)})}G[K.key]={at:I,list:he},F.push(...he)}f=F;let _=f.find(K=>K.sat.id===l);u=_?at.groundTrack(_.sat,I,90,60):[]}function B(b,I){let q=256*Math.pow(2,I.zoom),F=f.find(_=>_.sat.id===l);for(let _ of[-q,0,q]){if(F&&u.length){b.save(),b.strokeStyle=V(F.cat.colour,.7),b.setLineDash([4,4]),b.lineWidth=1.4;for(let K of u)b.beginPath(),K.forEach(([ee,te],ne)=>{let[he,$e]=I.project(ee,te);ne?b.lineTo(he+_,$e):b.moveTo(he+_,$e)}),b.stroke();b.restore()}for(let K of f){let[ee,te]=I.project(K.p.lat,K.p.lon),ne=ee+_;if(ne<-6||te<-6||ne>I.w+6||te>I.h+6)continue;let he=K.cat.key==="starlink";b.fillStyle=K.cat.colour,b.beginPath(),b.arc(ne,te,he?1.7:3.2,0,Math.PI*2),b.fill()}if(F){let[K,ee]=I.project(F.p.lat,F.p.lon),te=K+_;if(te<-40||ee<-20||te>I.w+40||ee>I.h+20)continue;b.save(),b.strokeStyle=F.cat.colour,b.lineWidth=1.5,b.shadowColor=F.cat.colour,b.shadowBlur=5,b.beginPath(),b.arc(te,ee,10,0,Math.PI*2),b.stroke(),b.restore(),b.save(),b.font="600 11.5px 'Chakra Petch', sans-serif",b.letterSpacing="1.2px",b.textAlign="left",b.textBaseline="middle";let ne=b.measureText(F.sat.name).width+10;b.fillStyle="rgba(22,33,47,.88)",b.fillRect(te+14,ee-7,ne,14),b.fillStyle=F.cat.colour,b.fillText(F.sat.name,te+19,ee),b.restore()}}}function Z(b){l!==b&&(l=b,X(!1),R(),A(),h.invalidate())}let Q=b=>f.filter(I=>W(I.p)===W(b.p)&&I.sat.id!==b.sat.id);function J(){let b=f.find(he=>he.sat.id===l);if(!b){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap a dot on the map, or a row in ABOVE YOU.</p>';return}let{sat:I,p:q,look:F,cat:_}=b;t("o-cs").textContent=I.name;let K=[w("Kind",oe(Tt(I.name))),w("Group",oe(_.label)),w("NORAD ID",String(I.id))];I.intl&&K.push(w("Launch",oe(I.intl))),K.push(w("Altitude",`${Math.round(q.altKm).toLocaleString()} km`)),K.push(w("Over",`${Math.abs(q.lat).toFixed(1)}\xB0${q.lat<0?"S":"N"} ${Math.abs(q.lon).toFixed(1)}\xB0${q.lon<0?"W":"E"}`)),K.push(w("From you",F.alt>0?`${F.alt.toFixed(0)}\xB0 up, ${me(F.az)}`:`<span class="dim">below the horizon, ${F.range.toLocaleString()} km away</span>`));let ee=at.elementAgeHours(I,r.cursor);K.push(w("Elements",`${ee<0?"newer than":""} ${U(Math.abs(ee))} ${ee<0?"ahead":"old"}`.trim()));let te=Q(b),ne=te.length?`<p class="hint">Same orbit data, so same position: ${te.slice(0,6).map(he=>oe(he.sat.name)).join(", ")}${te.length>6?` and ${te.length-6} more`:""}. Docked craft share the station's elements.</p>`:"";t("o-sel").innerHTML=K.join("")+ne+'<p class="hint">Dashed line: next 90 minutes of ground track. Kind is read from the catalogue name.</p>'}function x(){t("o-neartitle").textContent="ABOVE YOU",t("o-src").textContent="CELESTRAK";let b=new Set,I=f.filter(_=>_.look.alt>0).sort((_,K)=>K.look.alt-_.look.alt),q=[];for(let _ of I){let K=W(_.p);if(!b.has(K)&&(b.add(K),q.push({q:_,extra:Q(_).length}),q.length>=8))break}let F=Oe.some(_=>c[_.key]&&S[_.key]?.state==="ok");if(!q.length){t("o-near").innerHTML=`<p class="hint">${F?"Nothing in the chosen groups is above your horizon right now.":"Switch on a group above to see what is overhead."}</p>`;return}t("o-near").innerHTML='<div class="oh-head"><span>name</span><span>type</span><span>up</span><span>dir</span></div>'+q.map(({q:_,extra:K})=>`
      <button class="oh-row" data-sat="${_.sat.id}" aria-pressed="${_.sat.id===l}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${_.cat.colour} 80%, var(--ink))">${oe(_.sat.name)}${K?` +${K}`:""}</span>
        <span class="oh-t">${Tt(_.sat.name)==="satellite"?"":oe(Tt(_.sat.name))}</span>
        <span class="oh-d">${_.look.alt.toFixed(0)}\xB0</span>
        <span class="oh-a">${me(_.look.az)}</span>
      </button>`).join("");for(let _ of t("o-near").querySelectorAll(".oh-row"))_.addEventListener("click",()=>Z(Number(_.dataset.sat)))}function fe(){let b=Oe.filter(q=>c[q.key]&&S[q.key]?.state==="ok");t("o-count").textContent=`${f.length.toLocaleString()} SATELLITES`;let I=b.map(q=>S[q.key].fetched).filter(Boolean);t("o-age").textContent=I.length?`ELEMENTS ${U((Date.now()-Math.min(...I))/36e5).toUpperCase()} OLD`:"\u2014"}function Ae(){let b=Oe.some(F=>c[F.key]&&S[F.key]?.state==="loading"),I=Oe.some(F=>c[F.key]&&S[F.key]?.state==="fail");t("o-satstate").textContent=i?b?"LOADING":I?"NO DATA":`${f.length.toLocaleString()} SHOWN`:"OFF";let q=F=>{let _=S[F.key],K=!i||!c[F.key]?"":_?.state==="loading"?" \u2026":_?.state==="fail"?" \u2715":_?.state==="ok"?` ${_.sats.length.toLocaleString()}`:"";return`<button class="oh-chip" data-cat="${F.key}" aria-pressed="${!!c[F.key]}" style="--chip:${F.colour}">${oe(F.label)}${K}</button>`};t("o-satui").innerHTML=`
      <button class="oh-chip oh-mode" data-mode="1" aria-pressed="${i}">${i?"Back to aircraft":"Show satellites on map"}</button>
      <div class="oh-chips">${Oe.map(q).join("")}</div>
      ${I?'<p class="hint">Satellite elements are not available here. They are published to branyontech.com every two hours.</p>':""}
      ${i&&c.starlink?'<p class="hint">Starlink is thousands of objects: a large download, loaded only when on.</p>':""}
      ${i?'<p class="hint">Elements: CelesTrak. Positions computed here (SGP4).</p>':""}`}function de(){try{localStorage.setItem(Sn,JSON.stringify(c))}catch{}}function ve(b){if(i!==b){if(i=b,clearInterval(a),a=null,b){$(null),h.minZoom=1;let I=m();h.setView(H(I.lat*.5,-40,40),I.lon,$n);for(let q of Oe)c[q.key]&&O(q);r.view==="overhead"&&(a=setInterval(()=>{X(!1),fe(),A(),h.invalidate()},1e3)),X(!0)}else l=null,u=[],f=[],h.minZoom=5,h.setView(m().lat,m().lon,9),T();Ae(),R(),A(),P(),h.invalidate()}}return t("o-satui").addEventListener("click",b=>{let I=b.target.closest("button");if(!I)return;if(I.dataset.mode){ve(!i);return}let q=z(I.dataset.cat);q&&(c[q.key]=!c[q.key],de(),i&&c[q.key]&&O(q),X(!0),l!=null&&!f.some(F=>F.sat.id===l)&&(l=null),Ae(),R(),A(),P(),h.invalidate())}),t("o-center").addEventListener("click",()=>{r.loc&&(i?h.setView(H(r.loc.lat*.5,-40,40),r.loc.lon,$n):h.setView(r.loc.lat,r.loc.lon,9))}),t("o-zin").addEventListener("click",()=>h.setView(h.lat,h.lon,h.zoom+1)),t("o-zout").addEventListener("click",()=>h.setView(h.lat,h.lon,h.zoom-1)),r.on("loc",()=>{if(r.loc){if(i){X(!0),A(),h.invalidate(),D();return}h.setView(r.loc.lat,r.loc.lon,9),T(),D()}}),R(),C(),Ae(),r.on("cursor",()=>{r.view==="overhead"&&(C(),i&&(X(!1),R(),A(),h.invalidate()))}),{map:h,update(){C(),h.invalidate()},onShow(){h.resize(),T(),D(),clearInterval(M),M=setInterval(()=>{T(),P()},ga),i&&!a&&(a=setInterval(()=>{X(!1),fe(),A(),h.invalidate()},1e3))},onHide(){clearInterval(M),M=null,clearInterval(a),a=null}}}var re=null,Ge=null,Jt=!1,Pe=null,ya=0,Mt=1/0;function En(e,t=4){let o=e.createBuffer(1,e.sampleRate*t,e.sampleRate),n=o.getChannelData(0);for(let s=0;s<n.length;s++)n[s]=Math.random()*2-1;return o}function ho(e,t,{type:o,freq:n,q:s,gain:d}){let g=e.createBufferSource();g.buffer=En(e),g.loop=!0;let v=e.createBiquadFilter();v.type=o,v.frequency.value=n,v.Q.value=s;let y=e.createGain();return y.gain.value=d,g.connect(v).connect(y).connect(t),g.start(),{src:g,filt:v,gain:y}}function An(){if(re)return;let e=window.AudioContext||window.webkitAudioContext;if(!e)return;re=new e,Ge=re.createGain(),Ge.gain.value=0;let t=re.createDynamicsCompressor();t.threshold.value=-18,t.ratio.value=6,t.attack.value=.004,t.release.value=.25,Ge.connect(t).connect(re.destination);let o=ho(re,Ge,{type:"bandpass",freq:1400,q:.7,gain:0}),n=ho(re,Ge,{type:"highpass",freq:4200,q:.5,gain:0}),s=ho(re,Ge,{type:"bandpass",freq:420,q:1.6,gain:0}),d=re.createOscillator(),g=re.createGain();d.frequency.value=.07,g.gain.value=180,d.connect(g).connect(s.filt.frequency),d.start();let v=re.createGain();v.gain.value=0;let y=re.createBiquadFilter();y.type="lowpass",y.frequency.value=480,y.Q.value=.6,y.connect(v).connect(Ge);let M=[0,3.5].map(i=>{let c=re.createOscillator();c.type="sawtooth",c.frequency.value=55,c.detune.value=i;let S=re.createGain();return S.gain.value=.22,c.connect(S).connect(y),c.start(),c});Pe={rain:o,patter:n,wind:s,drone:{oscs:M,gain:v,filt:y},lfo:d,lfoGain:g}}function st(){return Jt}function Ln(e){Jt=e,re&&(e&&re.state==="suspended"&&re.resume(),Ye(Ge.gain,e?.5:0,e?1.2:.6))}var Ye=(e,t,o=.6)=>{let n=re.currentTime;e.cancelScheduledValues(n),e.setValueAtTime(e.value,n),e.linearRampToValueAtTime(t,n+o)};function wa(e=.5){if(!re||!Jt)return;let t=re.currentTime,o=re.createBufferSource();o.buffer=En(re,3);let n=re.createBiquadFilter();n.type="lowpass",n.frequency.setValueAtTime(700-e*480,t),n.Q.value=.5;let s=re.createGain(),d=.55*(1-e*.65);s.gain.setValueAtTime(1e-4,t),s.gain.exponentialRampToValueAtTime(Math.max(.02,d),t+.04+e*.3),s.gain.exponentialRampToValueAtTime(1e-4,t+1.6+e*2.4),o.connect(n).connect(s).connect(Ge),o.start(t),o.stop(t+4.2)}function Cn(e){if(!re||!Jt||!Pe)return;let t=e.frame();if(!t)return;let o=t.wx.kind,n=Math.min(1,Math.max((t.precip??0)/.1,o==="rain"||o==="storm"?t.wx.intensity*.5:0)),s=Math.min(1,(t.wind??0)/32),d=Math.min(1,((t.gust??t.wind??0)-(t.wind??0))/18);Ye(Pe.rain.gain.gain,n*.3,.9),Ye(Pe.rain.filt.frequency,900+n*1500,.9),Ye(Pe.patter.gain.gain,n*n*.1,.9),Ye(Pe.wind.gain.gain,s*.24,1.1),Ye(Pe.wind.filt.Q,1.2+d*2.5,1.1),Pe.lfo.frequency.value=.05+d*.22,Pe.lfoGain.gain.value=120+d*420;let g=t.temp??60,v=44+Math.max(0,Math.min(1,(g-20)/80))*26;for(let i of Pe.drone.oscs)i.frequency.setTargetAtTime(v,re.currentTime,1.5);Ye(Pe.drone.gain.gain,.055+(t.sun.altDeg>0?.02:.05),2),Ye(Pe.drone.filt.frequency,300+Math.max(0,t.sun.altDeg)*9,2);let y=o==="storm"?.9:Math.min(.6,(t.cape??0)/2500),M=performance.now();y>.15?(Mt===1/0&&(Mt=M+Math.random()*6e3),M>Mt&&(wa(Math.random()*(1-y*.6)),Mt=M+3e3+Math.random()*22e3*(1.1-y))):Mt=1/0,ya=y}function ba(e){let t=e.fmt,o=e.frame(Date.now());if(!o)return[];let n=[],s=o.day,d=Date.now();n.push({tone:"lead",text:`${t.full(d)}. It is ${Y.temp(o.temp)} and ${o.wx.long.toLowerCase()} in ${e.loc.name}`+(Math.abs((o.feels??o.temp)-o.temp)>=3?`, feeling like ${Y.temp(o.feels)}`:"")+"."});for(let p of e.alerts.slice(0,3))n.push({tone:"alert",text:`${p.event} in effect until ${t.weekday(p.expires)} ${t.hm12(p.expires)}.`+(p.instruction?` ${Ma(p.instruction)}`:"")});if(s){let p=e.climate?.doy?.[Sa(e,d)],a=`Today runs ${Y.temp(s.tmin)} to ${Y.temp(s.tmax)}`;if(p){let u=s.tmax-p.normalHigh;Math.abs(u)>=3?a+=`, ${Math.abs(u).toFixed(0)}\xB0 ${u>0?"above":"below"} the normal high of ${Y.temp(p.normalHigh)}`:a+=", right about normal",s.tmax>=p.recordHigh&&(a+=`. That would tie or beat the record of ${Y.temp(p.recordHigh)} set in ${p.recordHighYear}`)}n.push({tone:"body",text:a+"."})}let g=wt(e);if(g?.raining)n.push({tone:"wet",text:g.minutes!=null?`It is raining now and should ease within ${g.minutes} minutes.`:"It is raining now, with no break in the next six hours."});else if(g?.minutes!=null&&g.minutes<=240)n.push({tone:"wet",text:`Rain arrives in about ${g.minutes} minutes, around ${t.hm12(g.changeAt)}.`});else{let p=e.hours.find(a=>a.t>d&&(a.pop??0)>=40);p?n.push({tone:"body",text:`Dry for now. The next real chance of rain is ${t.weekday(p.t)} around ${t.hm12(p.t)}, at ${Math.round(p.pop)} percent.`}):n.push({tone:"body",text:"No meaningful rain anywhere in the sixteen-day window."})}let v=Math.max(...e.hours.filter(p=>p.t>d&&p.t<d+24*36e5).map(p=>p.gust??0),0);v>=22&&n.push({tone:"warn",text:`Wind is worth planning around: gusts reach ${Math.round(v)} miles per hour today, ${Ct(v).effect}.`});let y=Ve(o.dew);["STICKY","HUMID","OPPRESSIVE","MISERABLE","LETHAL"].includes(y.name)?n.push({tone:"warn",text:`The air is ${y.name.toLowerCase()} \u2014 dew point ${Y.temp(o.dew)}, ${y.note}.`}):y.name==="VERY DRY"&&n.push({tone:"body",text:`Very dry air, dew point ${Y.temp(o.dew)}. Expect static and chapped lips.`});let M=s?.uvMax;if(M!=null&&M>=6){let p=Math.round(350/(M*15));n.push({tone:"warn",text:`UV peaks at ${M.toFixed(1)}, ${qe(M).name.toLowerCase()}. Unprotected skin burns in roughly ${p} minutes.`})}let i=o.air?.aqi??e.airNow?.aqi;i!=null&&i>75&&n.push({tone:"warn",text:`Air quality is ${_e(i).name.toLowerCase()} at ${Math.round(i)} on the US index.`});let c=e.pollen;if(c?.index!=null&&c.index>=7){let p=(c.triggers||[]).map(a=>a.name).slice(0,3).join(", ");n.push({tone:"warn",text:`Pollen is ${gt(c.index).name.toLowerCase().replace("-"," to ")} at ${c.index.toFixed(1)} of 12${p?`, driven by ${p}`:""}.`})}let S=Bt.map(p=>({k:p,w:Gt(p,e,{hours:24,limit:1,minScore:62})[0]})).filter(p=>p.w).sort((p,a)=>a.w.peak-p.w.peak).slice(0,2);for(let p of S){let a=Wt(p.k);n.push({tone:"good",text:`Best window to ${a.label.toLowerCase()}: ${t.weekday(p.w.start)} ${t.hm12(p.w.start)} to ${t.hm12(p.w.end)}, scoring ${p.w.peak} out of 100.`})}let f=e.currentKp();if(f!=null&&f>=5){let p=Lt(f);n.push({tone:"space",text:`Geomagnetic activity is elevated: Kp ${f.toFixed(1)}, ${p.name}. Aurora may be visible to about ${p.lat} degrees latitude.`})}let l=e.sunTimesFor(d);return n.push({tone:"body",text:`Sunset is at ${t.hm12(l.sunset)}, with golden hour beginning ${t.hm12(l.goldenHour)}`+(s?.daylight?` and ${it(s.daylight)} of daylight today`:"")+"."}),n}var Ma=e=>{let t=String(e).replace(/\s+/g," ").match(/^.{0,180}?[.!?](\s|$)/);return(t?t[0]:String(e).slice(0,180)).trim()};function Sa(e,t){let[,o,n]=e.fmt.isoDate(t).split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][o-1]+n-1}var $a={lead:"var(--cy)",alert:"var(--rd)",warn:"var(--am)",wet:"var(--ice)",good:"var(--lm)",space:"var(--vi)",body:"var(--ink)"};function mo(e,t){let o=ba(e);t(`
    <div class="hd">BRIEFING<span class="rule"></span>
      <span class="val">${oe(e.loc.name.toUpperCase())} \xB7 ${e.fmt.hm(Date.now())}</span></div>
    <div class="res-list" style="max-height:60vh">
      ${o.map((n,s)=>`
        <p style="
          margin:0 0 10px;
          font-size:${s===0?".92rem":".8rem"};
          line-height:1.6;
          color:${$a[n.tone]||"var(--ink)"};
          ${n.tone==="alert"?"border-left:2px solid var(--rd);padding-left:10px;":""}
          ${s===0?"font-weight:600;":""}
        ">${oe(n.text)}</p>`).join("")}
    </div>
    <div style="display:flex;gap:6px;margin-top:12px">
      <button class="tl-btn" id="speakBtn">\u25B6 SPEAK</button>
      <button class="tl-btn" id="stopBtn">\u25A0 STOP</button>
    </div>
  `,n=>{let s=()=>{if(!window.speechSynthesis)return;speechSynthesis.cancel();let d=o.map(y=>y.text).join(" "),g=new SpeechSynthesisUtterance(d);g.rate=1.02,g.pitch=.85;let v=speechSynthesis.getVoices().find(y=>/en[-_](GB|US)/.test(y.lang)&&y.localService);v&&(g.voice=v),speechSynthesis.speak(g)};n.querySelector("#speakBtn").addEventListener("click",s),n.querySelector("#stopBtn").addEventListener("click",()=>speechSynthesis?.cancel()),e.settings.voice&&setTimeout(s,220)})}function Dn(e,t,o){let n=t.ownerDocument,s='a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]',d=null,g=!1,v=()=>[...t.querySelectorAll(s)].filter(f=>f.tabIndex>=0&&!f.matches(":disabled")&&!f.closest("[hidden], [inert]")&&f.getClientRects().length&&n.defaultView.getComputedStyle(f).visibility!=="hidden").sort((f,l)=>(f.tabIndex||1/0)-(l.tabIndex||1/0)),y=()=>(v()[0]||t).focus();function M(f){!e.hidden&&!t.contains(f.target)&&y()}function i(f){if(e.hidden||f.defaultPrevented||f.isComposing)return;if(f.key==="Escape"){f.preventDefault(),f.stopPropagation(),S();return}if(f.key!=="Tab"||f.ctrlKey||f.metaKey||f.altKey)return;let l=v(),p=l[0],a=l.at(-1);p?(!l.includes(n.activeElement)||(f.shiftKey?n.activeElement===p:n.activeElement===a))&&(f.preventDefault(),(f.shiftKey?a:p).focus()):(f.preventDefault(),t.focus({preventScroll:!0}))}function c(f,l,p){e.hidden&&(d=p||n.activeElement,g=o?.inert||!1,o&&(o.inert=!0),n.addEventListener("keydown",i,!0),n.addEventListener("focusin",M)),t.innerHTML=f;let a=t.querySelector(".hd");a?(a.id||="modalTitle",t.setAttribute("aria-labelledby",a.id),t.removeAttribute("aria-label")):(t.removeAttribute("aria-labelledby"),t.setAttribute("aria-label","Weather dialog")),e.hidden=!1,e.scrollTop=t.scrollTop=0,l&&l(t),t.contains(n.activeElement)||y()}function S(){if(e.hidden)return;e.hidden=!0,n.removeEventListener("keydown",i,!0),n.removeEventListener("focusin",M),t.innerHTML="",o&&(o.inert=g);let f=d;d=null,f?.isConnected&&!f.closest("[inert]")&&f.focus({preventScroll:!0})}return e.addEventListener("click",f=>{f.target===e&&S()}),{open:c,close:S}}var vo=["deck","radar","sky","air","data","overhead"],ka=5*6e4,ue={sky:document.getElementById("sky"),boot:document.getElementById("boot"),bootLog:document.getElementById("bootLog"),led:document.getElementById("led"),locBtn:document.getElementById("locBtn"),locName:document.getElementById("locName"),locSub:document.getElementById("locSub"),nav:document.getElementById("nav"),clockTime:document.getElementById("clockTime"),clockZone:document.getElementById("clockZone"),alertBtn:document.getElementById("alertBtn"),soundBtn:document.getElementById("soundBtn"),briefBtn:document.getElementById("briefBtn"),cfgBtn:document.getElementById("cfgBtn"),scrub:document.getElementById("scrub"),modal:document.getElementById("modal"),modalCard:document.getElementById("modalCard")},xe=new Ot(ue.sky),Nn=null,He={},Hn=Dn(ue.modal,ue.modalCard,document.getElementById("app")),In=[];function Ee(e,t=""){In.push(t?`<span class="${t}">${e}</span>`:e),ue.bootLog.innerHTML=In.join(`
`)}async function Ta(){Ee("ATMOS//NET v1.0.0"),Ee('<span class="mut">initialising atmospheric console\u2026</span>'),No();let e=new URLSearchParams(location.search).get("q");e!==null&&/^[0-3]$/.test(e)&&lo(+e),Ee(`render tier ${ae.tier} \xB7 ${ae.onBattery?"battery":"AC power"}`,"ok");let t=xe.init();xe.setQuality(ae.tier),Ee(t?"webgl2 sky renderer online":"webgl2 unavailable \u2014 sky disabled",t?"ok":"err"),ae.onChange(d=>xe.setQuality(d));let o=r.loc,n=null;o?Ee(`location: ${oe(o.name)}`):(n=await ce.config(),o=n.home,Ee(`no saved location \u2014 using ${oe(o.name)}`)),Ee('<span class="mut">contacting feeds\u2026</span>'),await r.setLocation(o,{remember:!n?.public});let s=r.raw;Ee(`open-meteo forecast  ${s?.forecast?.ok?"OK":"FAIL"}`,s?.forecast?.ok?"ok":"err"),Ee(`open-meteo air       ${s?.air?.ok?"OK":"FAIL"}`,s?.air?.ok?"ok":"err"),Ee(`nws alerts           ${s?.alerts?.ok?"OK":"FAIL"}`,s?.alerts?.ok?"ok":"err"),Ee(`noaa swpc space wx   ${s?.space?.ok?"OK":"FAIL"}`,s?.space?.ok?"ok":"err"),Ee(`${r.hours.length} hourly steps \xB7 ${r.days.length} days \xB7 ${r.min15.length} 15-min steps`,"ok"),Ea(),Ee("console ready","ok"),setTimeout(()=>{ue.boot.classList.add("done");let d=r.skyParams();d&&xe.snap(d)},0),Fn(),setInterval(()=>{document.hidden||r.refresh()},ka),Ca(n)}function Pn(e,t,o){Object.defineProperty(He,e,{configurable:!0,enumerable:!0,get(){let n=t(document.getElementById(o));return Object.defineProperty(He,e,{value:n,configurable:!0,enumerable:!0,writable:!0}),n}})}function Ea(){Nn=Yo(ue.scrub),He.deck=ln(document.getElementById("view-deck")),He.sky=gn(document.getElementById("view-sky")),He.air=yn(document.getElementById("view-air")),He.data=wn(document.getElementById("view-data")),Pn("radar",fn,"view-radar"),Pn("overhead",Tn,"view-overhead");let e=()=>{let o=He[r.view];o?.update&&o.update()};r.on("data",()=>{e(),po()}),r.on("cursor",()=>{e(),$t()}),r.on("climate",e),r.on("models",e),r.on("pollen",e),r.on("observed",e),r.on("radar",e),r.on("loc",po),r.on("status",o=>{ue.led.dataset.state=o==="ok"?"":o}),ue.nav.addEventListener("click",o=>{let n=o.target.closest("button[data-view]");n&&St(n.dataset.view)}),ue.locBtn.addEventListener("click",zn),ue.alertBtn.addEventListener("click",_n),ue.briefBtn.addEventListener("click",()=>mo(r,mt)),ue.cfgBtn.addEventListener("click",Bn),ue.soundBtn.addEventListener("click",yo),document.addEventListener("visibilitychange",()=>{document.hidden||(Qt=0,r.syncToNow())}),window.addEventListener("resize",()=>{xe.resize()}),document.addEventListener("keydown",Da),window.addEventListener("hashchange",()=>St(location.hash.slice(1),{push:!1}));let t=location.hash.slice(1);vo.includes(t)&&t!=="deck"?St(t):document.documentElement.style.setProperty("--stage-dim","0.25"),po(),e()}function po(){let e=r.loc;e&&(ue.locName.textContent=e.name,ue.locSub.textContent=[e.admin1,e.country].filter(Boolean).join(" \xB7 ")||`${e.lat.toFixed(2)}, ${e.lon.toFixed(2)}`),ue.clockZone.textContent=r.tz.split("/").pop().replace(/_/g," "),ue.alertBtn.dataset.n=String(r.alerts.length),ue.soundBtn.classList.toggle("on",st())}function St(e,{push:t=!0}={}){if(!vo.includes(e)||r.view===e)return;He[r.view]?.onHide?.(),r.view=e,Bo();let o=He[e];t&&location.hash.slice(1)!==e&&history.replaceState(null,"","#"+e);for(let n of ue.nav.querySelectorAll("button"))n.setAttribute("aria-selected",String(n.dataset.view===e));for(let n of document.querySelectorAll(".view"))n.classList.toggle("active",n.dataset.view===e);document.documentElement.style.setProperty("--stage-dim",e==="deck"?"0.25":"0.72"),o?.update&&o.update(),o?.onShow&&o.onShow()}var On=performance.now(),go=0,Qt=0,Aa=20;function Fn(e=performance.now()){requestAnimationFrame(Fn);let t=Math.min(.1,(e-On)/1e3);On=e,Ro(t),document.hidden||(xe.render(e,t),Nn?.tick(t),Qt+=t,Qt>Aa&&(Qt=0,r.syncToNow()),go+=t,(r.playing||go>.25)&&(go=0,$t()),La(e),Cn(r))}function $t(){let e=r.skyParams();e&&xe.set(e)}var Rn=0;function La(e){e-Rn<500||(Rn=e,ue.clockTime.textContent=r.fmt.hms(Date.now()))}function mt(e,t,o){Hn.open(e,t,o)}function Xt(){Hn.close()}function zn(){mt(`
    <div class="hd">LOCATION<span class="rule"></span><span class="val">ENTER TO SELECT \xB7 ESC TO CLOSE</span></div>
    <input class="search-input" id="q" placeholder="search any city, or paste  lat, lon" autocomplete="off" spellcheck="false">
    <button class="tl-btn" id="useloc" style="margin-top:8px">\u25CE USE MY LOCATION</button>
    <div class="res-list" id="res"></div>
  `,e=>{let t=e.querySelector("#q"),o=e.querySelector("#res"),n=[],s=0,d=null,g=()=>{n=r.favorites.map(i=>({...i,fav:!0})),v("SAVED")},v=i=>{if(!n.length){o.innerHTML=`<h3>${i}</h3><div class="nodata">no results</div>`;return}o.innerHTML=`<h3>${i}</h3>`+n.map((c,S)=>`
        <div class="res-item ${S===s?"sel":""}" data-i="${S}">
          <div>
            <b>${ht(c.name)}</b><br>
            <span>${ht([c.admin1,c.country||c.country_code].filter(Boolean).join(" \xB7 "))}</span>
          </div>
          <span class="coord">${(+c.latitude).toFixed(2)}, ${(+c.longitude).toFixed(2)}</span>
          ${c.fav?`<button class="rm" data-rm="${S}" title="Remove">\xD7</button>`:""}
        </div>`).join("")},y=async i=>{let c=n[i];c&&(r.addFavorite(c),Xt(),await r.setLocation(c),$t())};o.addEventListener("click",i=>{let c=i.target.closest("[data-rm]");if(c){i.stopPropagation(),r.removeFavorite(+c.dataset.rm),g();return}let S=i.target.closest("[data-i]");S&&y(+S.dataset.i)}),t.addEventListener("input",()=>{clearTimeout(d);let i=t.value.trim();if(!i){g();return}let c=i.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);if(c){let S=+c[1],f=+c[2];if(Math.abs(S)<=90&&Math.abs(f)<=180){n=[{name:`${S.toFixed(4)}, ${f.toFixed(4)}`,admin1:"coordinate",latitude:S,longitude:f}],s=0,v("COORDINATE");return}}d=setTimeout(async()=>{try{n=(await ce.geocode(i)).results||[],s=0,v("RESULTS")}catch{n=[],v("RESULTS")}},220)}),t.addEventListener("keydown",i=>{i.key==="ArrowDown"?(s=Math.min(n.length-1,s+1),v(o.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="ArrowUp"?(s=Math.max(0,s-1),v(o.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="Enter"&&(y(s),i.preventDefault())});let M=e.querySelector("#useloc");!navigator.geolocation||!window.isSecureContext?M.remove():M.addEventListener("click",()=>{M.textContent="\u25CE LOCATING\u2026",navigator.geolocation.getCurrentPosition(async i=>{let c=i.coords.latitude,S=i.coords.longitude,f=`${c.toFixed(2)}, ${S.toFixed(2)}`,l="",p="";try{let a=await ce.reverse(c,S);f=a.city||a.locality||a.principalSubdivision||f,l=a.principalSubdivision||"",p=a.countryCode||""}catch{}r.settings.geo="set",Xt(),await r.setLocation({name:f,admin1:l,country_code:p,latitude:c,longitude:S}),$t()},i=>{M.textContent=i.code===i.PERMISSION_DENIED?"\u25CE LOCATION BLOCKED IN BROWSER":"\u25CE LOCATION UNAVAILABLE"},{timeout:8e3,maximumAge:30*6e4})}),g(),t.focus()})}function _n(){let e=r.alerts;if(!e.length){mt(`<div class="hd">ALERTS<span class="rule"></span></div>
      <div class="nodata">no active watches, warnings or advisories for this location</div>`);return}mt(`
    <div class="hd" style="--ac:var(--rd)">ACTIVE ALERTS<span class="rule"></span><span class="val">${e.length}</span></div>
    <div class="res-list">
      ${e.map(t=>`
        <div style="padding:10px 0;border-bottom:1px solid rgba(255,255,255,.06)">
          <b style="color:#f47171;font-size:.82rem;letter-spacing:.08em">${ht(t.event)}</b>
          <div style="font-family:var(--mono);font-size:max(.6rem,var(--fs-floor,0px));color:var(--faint);margin:3px 0 6px">
            ${ht(t.senderName||"")} \xB7 until ${r.fmt.weekday(t.expires)} ${r.fmt.hm(t.expires)}
          </div>
          <div style="font-size:max(.72rem,var(--fs-floor,0px));color:var(--dim);line-height:1.5;white-space:pre-wrap">${ht((t.description||"").slice(0,900))}</div>
          ${t.instruction?`<div style="margin-top:7px;font-size:max(.7rem,var(--fs-floor,0px));color:var(--am);line-height:1.5">${ht(t.instruction.slice(0,400))}</div>`:""}
        </div>`).join("")}
    </div>
  `)}function Bn(e){let t=ae.manual;mt(`
    <div class="hd">SETTINGS<span class="rule"></span><span class="val">ATMOS//NET v1.0.0</span></div>
    <div class="setrow">
      <label>Render quality<span class="hint">Auto adapts to power state and measured frame rate</span></label>
      <div class="seg" id="qseg">
        ${["auto","0","1","2","3"].map(o=>`<button data-q="${o}" class="${String(t)===o||t==null&&o==="auto"?"on":""}">${o}</button>`).join("")}
      </div>
    </div>
    <div class="setrow">
      <label>Ambient audio<span class="hint">Generative soundscape matched to live conditions</span></label>
      <div class="seg"><button id="sndT" class="${st()?"on":""}">${st()?"on":"off"}</button></div>
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
  `,o=>{o.querySelector("#qseg").addEventListener("click",n=>{let s=n.target.closest("[data-q]");s&&(lo(s.dataset.q==="auto"?null:+s.dataset.q),o.querySelectorAll("[data-q]").forEach(d=>d.classList.toggle("on",d===s)))}),o.querySelector("#sndT").addEventListener("click",n=>{yo(),n.target.textContent=st()?"on":"off",n.target.classList.toggle("on",st())}),o.querySelector("#voiceT").addEventListener("click",n=>{r.settings.voice=!r.settings.voice,r.save(),n.target.textContent=r.settings.voice?"on":"off",n.target.classList.toggle("on",r.settings.voice)})},e?.currentTarget)}function yo(){let e=!st();An(),Ln(e),r.settings.sound=e,r.save(),ue.soundBtn.classList.toggle("on",e)}function Ca(e){e?.public&&(r.settings.geo||!navigator.geolocation||!window.isSecureContext||navigator.geolocation.getCurrentPosition(async t=>{let o=t.coords.latitude,n=t.coords.longitude,s=`${o.toFixed(2)}, ${n.toFixed(2)}`,d="",g="";try{let v=await ce.reverse(o,n);s=v.city||v.locality||v.principalSubdivision||s,d=v.principalSubdivision||"",g=v.countryCode||""}catch{}r.settings.geo="set",await r.setLocation({name:s,admin1:d,country_code:g,latitude:o,longitude:n}),$t()},t=>{t.code===t.PERMISSION_DENIED&&(r.settings.geo="denied",r.save())},{timeout:8e3,maximumAge:30*6e4,enableHighAccuracy:!1}))}function Da(e){if(e.defaultPrevented||e.isComposing)return;if(e.target.closest?.('input, textarea, select, button, a[href], summary, [contenteditable], [role="button"], [role="link"], [role="slider"], [role="textbox"], [role="combobox"]')){e.key==="Escape"&&Xt();return}if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest?.('[aria-modal="true"]'))return;let t=e.key;if(t==="Escape"){Xt();return}if(t>="1"&&t<="6"){St(vo[+t-1]);return}switch(t.toLowerCase()){case" ":r.playing=!r.playing,r.playing&&r.view!=="radar"&&(r.following=!1),r.playing&&r.cursor>=r.span.hi-6e4&&r.setCursor(Date.now()),r.emit("play",r.playing),e.preventDefault();break;case"arrowleft":r.playing=!1,r.scrubTo(r.cursor-(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"arrowright":r.playing=!1,r.scrubTo(r.cursor+(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"n":r.toNow();break;case"/":zn(),e.preventDefault();break;case"a":_n();break;case"b":mo(r,mt);break;case"s":yo();break;case",":Bn();break;case"r":r.refresh();break;case"f":document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();break;default:break}}var ht=oe;Ta().catch(e=>{console.error(e),Ee(`FATAL: ${e.message}`,"err")});window.ATMOS={store:r,sky:xe,perf:ae,setView:St,views:He};export{Xt as closeModal,mt as openModal};
