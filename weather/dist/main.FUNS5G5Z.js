import{a as xe,b as He,c as Fe,d as $t,e as mt,f as Ze,g as Je,h as bo,i as Mo,j as Ie,k as kt}from"./chunk.7JX7BFLW.js";var Bn=new URL("./",location.href);async function be(e,t){let o=new URL(e.replace(/^\//,""),Bn);for(let[s,l]of Object.entries(t||{}))l!=null&&o.searchParams.set(s,l);let n=await fetch(o,{cache:"no-store"});if(!n.ok)throw new Error(`${e} -> ${n.status}`);return n.json()}var ce={config:()=>be("/api/config"),bundle:(e,t)=>be("/api/bundle",{lat:e,lon:t}),climate:(e,t)=>be("/api/climate",{lat:e,lon:t}),models:(e,t)=>be("/api/models",{lat:e,lon:t}),pollen:(e,t)=>be("/api/pollen",{lat:e,lon:t}),observations:(e,t)=>be("/api/observations",{lat:e,lon:t}),radar:()=>be("/api/radar"),space:()=>be("/api/space"),aurora:()=>be("/api/aurora"),iss:()=>be("/api/iss"),aircraft:(e,t,o)=>be("/api/aircraft",{lat:e,lon:t,dist:o}),flight:(e,t)=>be("/api/flight",{cs:e,hex:t}),elsewhere:e=>be("/api/elsewhere",{q:e}),geocode:e=>be("/api/geocode",{q:e}),reverse:(e,t)=>be("/api/reverse",{lat:e,lon:t})};var Wn={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"},oe=e=>String(e??"").replace(/[<>&"']/g,t=>Wn[t]),H=(e,t,o)=>Math.min(o,Math.max(t,e)),Tt=(e,t,o)=>e+(t-e)*o;var x={temp:e=>e==null?"--":`${Math.round(e)}\xB0`,tempP:e=>e==null?"--":`${e.toFixed(1)}\xB0`,pct:e=>e==null?"--":`${Math.round(e)}%`,wind:e=>e==null?"--":`${Math.round(e)}`,pressure:e=>e==null?"--":(e*.029529983071445).toFixed(2),inches:e=>e==null?"--":e<.01&&e>0?"<0.01":e.toFixed(2),miles:e=>e==null?"--":e>=1609*9?"10+":(e/1609.344).toFixed(1),int:e=>e==null?"--":String(Math.round(e)),signed:(e,t=1)=>e==null?"--":`${e>=0?"+":"\u2212"}${Math.abs(e).toFixed(t)}`},Un=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"],me=e=>e==null?"--":Un[Math.round((e%360+360)%360/22.5)%16];function st(e){if(e==null)return"--";let t=Math.floor(e/3600),o=Math.round(e%3600/60);return t?`${t}h ${String(o).padStart(2,"0")}m`:`${o}m`}function Xt(e){let t=e-Date.now(),o=Math.abs(t),n=Math.round(o/6e4);if(n<1)return"now";let s=n<60?`${n} min`:`${Math.floor(n/60)}h ${String(n%60).padStart(2,"0")}m`;return t>0?`in ${s}`:`${s} ago`}var So={0:["CLEAR","Clear sky","clear",0],1:["MAINLY CLEAR","Mainly clear","clear",0],2:["PARTLY CLOUDED","Partly cloudy","cloud",.4],3:["OVERCAST","Overcast","cloud",1],45:["FOG","Fog","fog",.7],48:["RIME FOG","Depositing rime fog","fog",1],51:["LIGHT DRIZZLE","Light drizzle","rain",.2],53:["DRIZZLE","Moderate drizzle","rain",.35],55:["DENSE DRIZZLE","Dense drizzle","rain",.5],56:["FREEZING DRIZZLE","Light freezing drizzle","rain",.3],57:["FREEZING DRIZZLE+","Dense freezing drizzle","rain",.5],61:["LIGHT RAIN","Slight rain","rain",.35],63:["RAIN","Moderate rain","rain",.6],65:["HEAVY RAIN","Heavy rain","rain",1],66:["FREEZING RAIN","Light freezing rain","rain",.5],67:["FREEZING RAIN+","Heavy freezing rain","rain",.9],71:["LIGHT SNOW","Slight snow fall","snow",.3],73:["SNOW","Moderate snow fall","snow",.6],75:["HEAVY SNOW","Heavy snow fall","snow",1],77:["SNOW GRAINS","Snow grains","snow",.3],80:["RAIN SHOWERS","Slight rain showers","rain",.45],81:["RAIN SHOWERS","Moderate rain showers","rain",.7],82:["VIOLENT SHOWERS","Violent rain showers","rain",1],85:["SNOW SHOWERS","Slight snow showers","snow",.5],86:["HEAVY SNOW SHOWERS","Heavy snow showers","snow",1],95:["THUNDERSTORM","Thunderstorm","storm",.7],96:["T-STORM + HAIL","Thunderstorm with slight hail","storm",.85],99:["SEVERE T-STORM","Thunderstorm with heavy hail","storm",1]};function Qe(e){let t=So[e]||So[0];return{code:e,label:t[0],long:t[1],kind:t[2],intensity:t[3]}}function eo(e,t=!0){let o=Qe(e).kind;return o==="clear"?e===0?t?"\u2600":"\u263E":t?"\u26C5":"\u2601":o==="cloud"?e===3?"\u2601":t?"\u26C5":"\u2601":o==="fog"?"\u2591":o==="rain"?"\u2614":o==="snow"?"\u2744":o==="storm"?"\u26A1":"\u25CB"}function ze(e){return e==null?{name:"NO DATA",color:"#8d9aab",level:0}:e<=50?{name:"GOOD",color:"#8fdc6a",level:1}:e<=100?{name:"MODERATE",color:"#ecd46a",level:2}:e<=150?{name:"SENSITIVE GROUPS",color:"#f59a5b",level:3}:e<=200?{name:"UNHEALTHY",color:"#f47171",level:4}:e<=300?{name:"VERY UNHEALTHY",color:"#c89af5",level:5}:{name:"HAZARDOUS",color:"#ef5a6a",level:6}}function Ge(e){return e==null?{name:"NO DATA",color:"#8d9aab"}:e<3?{name:"LOW",color:"#8fdc6a"}:e<6?{name:"MODERATE",color:"#ecd46a"}:e<8?{name:"HIGH",color:"#f59a5b"}:e<11?{name:"VERY HIGH",color:"#f47171"}:{name:"EXTREME",color:"#c89af5"}}var $o=[null,200,250,300,450,600,1e3];function Et(e,t=3){if(!e||e<=.1)return null;let o=$o[t]??$o[3];return Math.round(o/(e*1.5))}function pt(e){return e==null?{name:"NO DATA",color:"#8d9aab"}:e<2.5?{name:"LOW",color:"#8fdc6a"}:e<4.9?{name:"LOW-MED",color:"#c6dc6e"}:e<7.3?{name:"MEDIUM",color:"#ecd46a"}:e<9.7?{name:"MED-HIGH",color:"#f59a5b"}:{name:"HIGH",color:"#f47171"}}function At(e){return e==null?{name:"NO DATA",color:"#8d9aab",lat:null}:e<3?{name:"QUIET",color:"#6bb3bd",lat:66}:e<4?{name:"UNSETTLED",color:"#3fd0d8",lat:63}:e<5?{name:"ACTIVE",color:"#8fdc6a",lat:60}:e<6?{name:"G1 STORM",color:"#ecd46a",lat:56}:e<7?{name:"G2 STORM",color:"#f59a5b",lat:53}:e<8?{name:"G3 STORM",color:"#f47171",lat:50}:e<9?{name:"G4 STORM",color:"#c89af5",lat:47}:{name:"G5 EXTREME",color:"#ef5a6a",lat:42}}function Lt(e){return e==null?{name:"--",effect:""}:e<1?{name:"CALM",effect:"smoke rises vertically"}:e<4?{name:"LIGHT AIR",effect:"smoke drifts"}:e<8?{name:"LIGHT BREEZE",effect:"leaves rustle"}:e<13?{name:"GENTLE BREEZE",effect:"flags extend"}:e<19?{name:"MODERATE",effect:"dust and paper lift"}:e<25?{name:"FRESH BREEZE",effect:"small trees sway"}:e<32?{name:"STRONG BREEZE",effect:"umbrellas fail"}:e<39?{name:"NEAR GALE",effect:"walking is work"}:e<47?{name:"GALE",effect:"twigs break off"}:e<55?{name:"STRONG GALE",effect:"shingles lift"}:e<64?{name:"STORM",effect:"trees uprooted"}:e<73?{name:"VIOLENT STORM",effect:"widespread damage"}:{name:"HURRICANE",effect:"devastation"}}function qe(e){return e==null?{name:"--",color:"#8d9aab",note:""}:e<30?{name:"VERY DRY",color:"#7fb2f0",note:"static, chapped lips"}:e<45?{name:"DRY",color:"#3fd0d8",note:"crisp and comfortable"}:e<55?{name:"COMFORTABLE",color:"#8fdc6a",note:"ideal"}:e<60?{name:"STICKY",color:"#c6dc6e",note:"noticeable humidity"}:e<65?{name:"HUMID",color:"#ecd46a",note:"uncomfortable"}:e<70?{name:"OPPRESSIVE",color:"#f59a5b",note:"sweat does not evaporate"}:e<75?{name:"MISERABLE",color:"#f47171",note:"dangerous for exertion"}:{name:"LETHAL",color:"#ef5a6a",note:"limit outdoor exposure"}}function gt(e="",t=""){let o=e.toLowerCase();return/tornado|hurricane|extreme|tsunami/.test(o)?"#ef5a6a":/warning/.test(o)?"#f47171":/watch/.test(o)?"#f59a5b":/advisory|statement/.test(o)?"#ecd46a":t==="Extreme"||t==="Severe"?"#f47171":"#3fd0d8"}function Ct(e){let t=h=>new Intl.DateTimeFormat("en-US",{timeZone:e,...h}),o=t({hour:"2-digit",minute:"2-digit",hour12:!1}),n=t({hour:"numeric",minute:"2-digit",hour12:!0}),s=t({hour:"numeric",hour12:!0}),l=t({weekday:"short"}),y=t({month:"short",day:"numeric"}),g=t({weekday:"long",month:"long",day:"numeric"}),w=t({hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),v=h=>{if(h==null)return null;let d=new Date(h);return Number.isNaN(+d)?null:d},i=h=>d=>{let m=v(d);return m?h.format(m):"--"},u=new Intl.DateTimeFormat("en-CA",{timeZone:e}),S=new Intl.DateTimeFormat("en-US",{timeZone:e,hour:"numeric",minute:"numeric",hour12:!1});return{hm:i(o),hm12:i(n),hour:i(s),weekday:i(l),monthDay:i(y),full:i(g),hms:i(w),isoDate:h=>{let d=v(h);return d?u.format(d):"--"},hourOfDay:h=>{let d=v(h);if(!d)return NaN;let m=S.formatToParts(d),a=c=>+m.find(f=>f.type===c)?.value;return a("hour")%24+a("minute")/60}}}function ko(e,t){let o=new Date(e);if(Number.isNaN(+o))return NaN;let n=new Intl.DateTimeFormat("en-CA",{timeZone:t}).format(o),[,s,l]=n.split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][s-1]+l-1}var To="atmos.v1";function oo(e,t){if(!e||typeof e!="object")return null;let o=e.latitude??e.lat,n=e.longitude??e.lon,s=l=>(typeof l=="number"||typeof l=="string"&&l.trim()!=="")&&Number.isFinite(+l);return!s(o)||!s(n)||Math.abs(+o)>90||Math.abs(+n)>180?null:{name:e.name,admin1:e.admin1||"",country:e.country_code||e.country||"",lat:+o,lon:+n,tz:e.timezone||e.tz||t,elevation:e.elevation??null}}function Eo(e){let t=oo(e);return t&&{name:t.name,admin1:t.admin1,country_code:t.country,latitude:t.lat,longitude:t.lon,timezone:t.tz}}var no=e=>typeof e=="string"&&e?`${e.includes("T")?e:`${e}T00:00:00`}Z`:"",Io=e=>t=>Date.parse(no(t))-e*1e3;function Dt(e,t,o){if(!e?.time?.length)return[];let n=Io(t),s=e.time.length,l=new Array(s);for(let y=0;y<s;y++){let g={t:n(e.time[y]),i:y};for(let[w,v]of Object.entries(o))g[w]=e[v]?.[y]??null;l[y]=g}return l}var Ao={temp:"temperature_2m",rh:"relative_humidity_2m",dew:"dew_point_2m",feels:"apparent_temperature",pop:"precipitation_probability",precip:"precipitation",rain:"rain",showers:"showers",snow:"snowfall",snowDepth:"snow_depth",code:"weather_code",pressure:"pressure_msl",surfPressure:"surface_pressure",cloud:"cloud_cover",cloudLow:"cloud_cover_low",cloudMid:"cloud_cover_mid",cloudHigh:"cloud_cover_high",vis:"visibility",vpd:"vapour_pressure_deficit",wind:"wind_speed_10m",windDir:"wind_direction_10m",gust:"wind_gusts_10m",uv:"uv_index",uvClear:"uv_index_clear_sky",isDay:"is_day",sunshine:"sunshine_duration",cape:"cape",li:"lifted_index",cin:"convective_inhibition",freezing:"freezing_level_height",blh:"boundary_layer_height",wetbulb:"wet_bulb_temperature_2m",soilT:"soil_temperature_0cm",soilM:"soil_moisture_0_to_1cm",et0:"et0_fao_evapotranspiration"},Gn={code:"weather_code",tmax:"temperature_2m_max",tmin:"temperature_2m_min",feelsMax:"apparent_temperature_max",feelsMin:"apparent_temperature_min",sunriseS:"sunrise",sunsetS:"sunset",daylight:"daylight_duration",sunshine:"sunshine_duration",uvMax:"uv_index_max",precip:"precipitation_sum",rain:"rain_sum",showers:"showers_sum",snow:"snowfall_sum",precipHours:"precipitation_hours",pop:"precipitation_probability_max",windMax:"wind_speed_10m_max",gustMax:"wind_gusts_10m_max",windDir:"wind_direction_10m_dominant",radiation:"shortwave_radiation_sum",et0:"et0_fao_evapotranspiration"},Lo={precip:"precipitation",code:"weather_code",cape:"cape",vis:"visibility",gust:"wind_gusts_10m",isDay:"is_day"},Co={aqi:"us_aqi",pm10:"pm10",pm25:"pm2_5",co:"carbon_monoxide",no2:"nitrogen_dioxide",so2:"sulphur_dioxide",o3:"ozone",aod:"aerosol_optical_depth",dust:"dust",uv:"uv_index",alder:"alder_pollen",birch:"birch_pollen",grass:"grass_pollen",mugwort:"mugwort_pollen",olive:"olive_pollen",ragweed:"ragweed_pollen"},qn=.3048;function Do(e,t,o){if(!t||!e?.length)return;let n=Object.entries(o).filter(([,s])=>t[s]==="ft").map(([s])=>s);if(n.length)for(let s of e)for(let l of n)s[l]!=null&&(s[l]*=qn)}var Vn=new Set(["code","isDay","i"]);function jn(e,t,o){if(!e)return t?{...t}:null;if(!t)return{...e};let n={};for(let s in e){let l=e[s],y=t[s];if(Vn.has(s)){n[s]=o<.5?l:y;continue}typeof l=="number"&&typeof y=="number"?n[s]=s==="windDir"?((l+(((y-l)%360+540)%360-180)*o)%360+360)%360:Tt(l,y,o):n[s]=l??y}return n}function to(e,t){if(!e?.length)return null;if(t<=e[0].t)return{...e[0]};if(t>=e.at(-1).t)return{...e.at(-1)};let o=e[1].t-e[0].t,n=(t-e[0].t)/o,s=H(Math.floor(n),0,e.length-2);return jn(e[s],e[s+1],n-s)}var ao=class{constructor(){this.listeners=new Map,this.requestId=0,this.pendingLocation=null,this.pendingRemember=!0,this.loc=null,this.tz=Intl.DateTimeFormat().resolvedOptions().timeZone,this.fmt=Ct(this.tz),this.raw=null,this.hours=[],this.days=[],this.min15=[],this.air=[],this.airNow=null,this.alerts=[],this.space=null,this.climate=null,this.models=null,this.pollen=null,this.radar=null,this.observed=null,this.cursor=Date.now(),this.now=Date.now(),this.following=!0,this.playing=!1,this.playRate=1,this.view="deck",this.status="boot",this.lastFetch=0,this.favorites=[],this.settings={sound:!1,skinType:3,voice:!0},this.restore()}on(t,o){return this.listeners.has(t)||this.listeners.set(t,new Set),this.listeners.get(t).add(o),()=>this.listeners.get(t).delete(o)}emit(t,o){for(let n of this.listeners.get(t)||[])try{n(o)}catch(s){console.error(`[store:${t}]`,s)}}restore(){try{let t=JSON.parse(localStorage.getItem(To)||"{}");t.loc&&(this.loc=oo(t.loc,this.tz)),Array.isArray(t.favorites)&&(this.favorites=t.favorites.map(Eo).filter(Boolean)),t.settings&&Object.assign(this.settings,t.settings)}catch{}}save(){try{localStorage.setItem(To,JSON.stringify({loc:this.loc,favorites:this.favorites,settings:this.settings}))}catch{}}setStatus(t){this.status=t,this.emit("status",t)}async setLocation(t,{remember:o=!0}={}){let n=oo(t,this.tz);n&&(this.pendingLocation=n,this.pendingRemember=o,await this.refresh({full:!0}))}addFavorite(t){let o=s=>`${(+(s.lat??s.latitude)).toFixed(3)},${(+(s.lon??s.longitude)).toFixed(3)}`,n=Eo(t);n&&(this.favorites=this.favorites.filter(s=>o(s)!==o(n)),this.favorites.unshift(n),this.favorites=this.favorites.slice(0,12),this.save(),this.emit("favorites",this.favorites))}removeFavorite(t){this.favorites.splice(t,1),this.save(),this.emit("favorites",this.favorites)}async refresh({full:t=!1}={}){let o=this.pendingLocation||this.loc;if(!o)return;let{lat:n,lon:s}=o,l=this.pendingLocation,y=this.pendingRemember,g=++this.requestId,w=()=>g===this.requestId;t=t||!!l,this.setStatus("load");try{let i=await ce.bundle(n,s);if(!w())return;if(!i.forecast?.ok||!Array.isArray(i.forecast.data?.hourly?.time)||!i.forecast.data.hourly.time.length)throw new Error(`Forecast unavailable for ${o.name||"this location"}`);let u=i.forecast.data.timezone||o.tz,S=Ct(u),h={loc:{...o,tz:u},tz:u,fmt:S,following:this.following,cursor:this.cursor};this.ingest.call(h,i),(!this.loc||this.loc.lat!==n||this.loc.lon!==s)&&(this.climate=this.models=this.pollen=this.observed=this.radar=null),Object.assign(this,h),this.pendingLocation=null,l&&y&&this.save(),this.lastFetch=Date.now(),this.setStatus("ok"),l&&this.emit("loc",this.loc),this.emit("data",this)}catch(i){if(!w())return;console.error("[store] bundle failed",i),this.setStatus("err"),this.emit("error",i);return}let v=[ce.radar().then(i=>{w()&&(this.radar=i,this.emit("radar",i))}),ce.pollen(n,s).then(i=>{w()&&(this.pollen=i,this.emit("pollen",i))}),ce.observations(n,s).then(i=>{w()&&(this.observed=i,this.emit("observed",i))})];(t||!this.climate)&&v.push(ce.climate(n,s).then(i=>{w()&&(this.climate=i,this.emit("climate",i))})),(t||!this.models)&&v.push(ce.models(n,s).then(i=>{w()&&(this.models=this.reduceModels(i),this.emit("models",this.models))})),Promise.allSettled(v).then(()=>{w()&&this.emit("data",this)})}ingest(t){this.raw=t;let o=t.forecast?.ok?t.forecast.data:null;if(o){let s=o.utc_offset_seconds??0;this.utcOffset=s,this.elevation=o.elevation,o.timezone&&o.timezone!==this.tz&&(this.tz=o.timezone,this.fmt=Ct(this.tz),this.loc&&(this.loc.tz=o.timezone)),this.hours=Dt(o.hourly,s,Ao),this.min15=Dt(o.minutely_15,s,Lo),Do(this.hours,o.hourly_units,Ao),Do(this.min15,o.minutely_15_units,Lo),this.days=Dt(o.daily,s,Gn).map(l=>({...l,sunrise:l.sunriseS?Date.parse(no(l.sunriseS))-s*1e3:null,sunset:l.sunsetS?Date.parse(no(l.sunsetS))-s*1e3:null}))}let n=t.air?.ok?t.air.data:null;if(this.air=[],this.airNow=null,n&&(this.air=Dt(n.hourly,n.utc_offset_seconds??0,Co),this.airNow=n.current?Object.fromEntries(Object.entries(Co).map(([s,l])=>[s,n.current[l]??null])):null),this.alerts=t.alerts?.ok&&Array.isArray(t.alerts.data?.features)?t.alerts.data.features.filter(s=>s&&typeof s=="object").map(s=>({...s.properties,geometry:s.geometry})):[],this.space=t.space?.ok?t.space.data:null,this.hours.length){let s=this.following?Date.now():this.cursor;this.cursor=H(s,this.hours[0].t,this.hours.at(-1).t)}}reduceModels(t){let o=t?.hourly;if(!o?.time?.length)return null;let n=t.utc_offset_seconds??0,s=Io(n),l=Object.keys(o).filter(g=>g.startsWith("temperature_2m_")).map(g=>g.replace("temperature_2m_","")),y=[];for(let g=0;g<o.time.length;g++){let w=l.map(u=>o[`temperature_2m_${u}`]?.[g]).filter(u=>u!=null),v=l.map(u=>o[`precipitation_${u}`]?.[g]).filter(u=>u!=null);if(!w.length)continue;let i=w.reduce((u,S)=>u+S,0)/w.length;y.push({t:s(o.time[g]),mean:i,min:Math.min(...w),max:Math.max(...w),spread:Math.max(...w)-Math.min(...w),temps:w,precipAgree:v.length?v.filter(u=>u>.004).length/v.length:null})}return{names:l,rows:y}}setCursor(t,{silent:o=!1}={}){if(!this.hours.length)return;let n=this.hours[0].t,s=this.hours.at(-1).t;this.cursor=H(t,n,s),o||this.emit("cursor",this.cursor)}scrubTo(t,o){this.following=!1,this.setCursor(t,o)}syncToNow(){if(!this.following||this.playing||this.view==="radar")return;let t=Date.now();Math.abs(t-this.cursor)<1e3||this.setCursor(t)}toNow(){this.playing=!1,this.following=!0,this.setCursor(Date.now()),this.emit("play",!1)}get atNow(){return Math.abs(this.cursor-Date.now())<9e4}get span(){return this.hours.length?{lo:this.hours[0].t,hi:this.hours.at(-1).t}:{lo:0,hi:0}}frame(t=this.cursor){let o=to(this.hours,t);if(!o)return null;let n={...o,t},s=to(this.min15,t);s&&Math.abs(s.t-t)<30*6e4&&s.precip!=null&&(n.precip=s.precip,n.code=s.code??n.code,s.cape!=null&&(n.cape=s.cape),s.vis!=null&&(n.vis=s.vis),s.gust!=null&&(n.gust=s.gust));let l=to(this.air,t);l&&(n.air=l),n.wx=Qe(Math.round(n.code??0)),n.day=this.dayFor(t);let{lat:y,lon:g}=this.loc||{lat:0,lon:0},w=new Date(t),v=xe(w,y,g),i=Ze(w,y,g),u=Je(w);return n.sun={alt:v.altitude,az:v.azimuth,altDeg:v.altitude*57.29578,compass:He(v.azimuth)},n.moon={alt:i.altitude,az:i.azimuth,altDeg:i.altitude*57.29578,compass:He(i.azimuth),phase:u.phase,fraction:u.fraction,distance:i.distance},n}dayFor(t){let o=this.fmt.isoDate(t);return this.days.find(n=>this.fmt.isoDate(n.t)===o)||null}sunTimesFor(t=this.cursor){let{lat:o,lon:n}=this.loc||{lat:0,lon:0};return $t(new Date(t),o,n,this.elevation||0)}moonTimesFor(t=this.cursor){let{lat:o,lon:n}=this.loc||{lat:0,lon:0};return Mo(new Date(t),o,n)}skyParams(t=this.cursor){let o=this.frame(t);if(!o)return null;let n=o.wx.kind,s=o.precip??0,l=H(s/.12,0,1),y=n==="rain"||n==="snow"||n==="storm"?H(Math.max(o.wx.intensity*.55,l),0,1):l*.6,g=this.currentKp()??2;return{sunAlt:o.sun.alt,sunAz:o.sun.az+Math.PI,moonAlt:o.moon.alt,moonAz:o.moon.az+Math.PI,moonPhase:o.moon.phase,moonFrac:o.moon.fraction,viewAz:this.viewBearing(o),cloudLow:H((o.cloudLow??0)/100,0,1),cloudMid:H((o.cloudMid??0)/100,0,1),cloudHigh:H((o.cloudHigh??0)/100,0,1),precip:y,snow:n==="snow"?1:0,storm:n==="storm"?.85:H((o.cape??0)/2500,0,.6),fog:n==="fog"?.85:H(1-(o.vis??2e4)/6e3,0,.6),wind:o.wind??5,windDir:((o.windDir??0)+180)*Math.PI/180,kp:g,lat:this.loc?.lat??0,haze:H(1-(o.vis??24e3)/24e3,0,.8),cityGlow:.55}}viewBearing(t){let o=(this.loc?.lat??0)>=0?Math.PI:0;return t.sun.altDeg>-8?t.sun.az+Math.PI:t.moon.altDeg>2?t.moon.az+Math.PI:o}currentKp(){let t=this.space?.kpNow;if(t?.ok&&Array.isArray(t.data)&&t.data.length){let o=t.data.at(-1),n=Number(o.estimated_kp??o.kp_index);if(Number.isFinite(n))return n}return null}kpForecast(){let t=this.space?.kpFc;if(!t?.ok||!Array.isArray(t.data)||!t.data.length)return[];let o=t.data;return(Array.isArray(o[0])?o.slice(1).map(s=>({time_tag:s[0],kp:s[1],observed:s[2]})):o).map(s=>({t:Date.parse(String(s.time_tag).replace(" ","T").replace(/Z?$/,"Z")),kp:Number(s.kp??s.kp_index??s.estimated_kp),observed:s.observed})).filter(s=>Number.isFinite(s.kp)&&Number.isFinite(s.t))}},r=new ao;var io=new Set,ae={tier:2,fps:60,onBattery:!1,batteryLevel:1,hidden:!1,reducedMotion:matchMedia("(prefers-reduced-motion: reduce)").matches,manual:null,onChange(e){return io.add(e),()=>io.delete(e)}},so=0,It=0,Po=0,lt=0,dt=0;function Oo(e){so++,It+=e;let t=performance.now();if(t-Po<1e3)return;Po=t,ae.fps=It>0?so/It:60,so=0,It=0,ae.fps<40?(lt++,dt=0):ae.fps>55?(dt++,lt=0):(lt=0,dt=0);let o=it();o!==ae.tier&&rt(o)}function Kn(){return typeof matchMedia!="function"?!1:matchMedia("(pointer: coarse)").matches&&matchMedia("(max-width: 820px)").matches}function it(){if(ae.manual!=null)return ae.manual;if(ae.hidden)return 0;if(ae.reducedMotion)return 1;if(Kn()){let t=1;return lt>=3&&(t=Math.max(0,ae.tier-1)),dt>=6&&ae.tier<2&&(t=ae.tier+1),Math.max(0,Math.min(2,t))}let e=ae.onBattery?2:3;return ae.onBattery&&ae.batteryLevel<.25&&(e=1),lt>=3&&(e=Math.max(0,ae.tier-1)),dt>=6&&e>ae.tier&&(e=ae.tier+1),Math.max(0,Math.min(3,e))}function rt(e){ae.tier=e,document.documentElement.dataset.q=String(e),lt=0,dt=0;for(let t of io)t(e)}function Ro(){document.addEventListener("visibilitychange",()=>{ae.hidden=document.hidden,rt(it())}),matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{ae.reducedMotion=e.matches,rt(it())}),navigator.getBattery&&navigator.getBattery().then(e=>{let t=()=>{ae.onBattery=!e.charging,ae.batteryLevel=e.level,rt(it())};e.addEventListener("chargingchange",t),e.addEventListener("levelchange",t),t()}).catch(()=>{}),rt(it())}function ro(e){ae.manual=e,rt(it())}var Yn=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,xn=`#version 300 es
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
}`,No={sunAlt:.4,sunAz:3,moonAlt:-.4,moonAz:1,moonPhase:.25,moonFrac:.5,viewAz:Math.PI,cloudLow:.2,cloudMid:.1,cloudHigh:.1,precip:0,snow:0,storm:0,fog:0,wind:6,windDir:4,kp:2,lat:33.6,haze:.15,cityGlow:.5},Zn=new Set(["snow","lat"]),Pt=class{constructor(t){this.canvas=t,this.gl=null,this.params={...No},this.target={...No},this.quality=2,this.running=!1,this.flash=0,this.nextBolt=1/0,this.scale=1,this.ok=!1,this.t0=performance.now()}init(){let t=this.canvas.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1});if(!t)return this.ok=!1,!1;this.gl=t;let o=Jn(t,Yn,xn);if(!o)return this.ok=!1,!1;this.prog=o,t.useProgram(o);let n=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,n),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let s=t.getAttribLocation(o,"aPos");t.enableVertexAttribArray(s),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0),this.u={};for(let l of["uRes","uTime","uQuality","uSunAlt","uSunAz","uMoonAlt","uMoonAz","uMoonPhase","uMoonFrac","uViewAz","uCloudLow","uCloudMid","uCloudHigh","uPrecip","uSnow","uStorm","uFlash","uFog","uWind","uWindDir","uKp","uLat","uHaze","uCityGlow"])this.u[l]=t.getUniformLocation(o,l);return this.resize(),this.ok=!0,!0}set(t){Object.assign(this.target,t)}snap(t){Object.assign(this.target,t),Object.assign(this.params,t)}setQuality(t){this.quality=t,this.scale=t>=3?1:t===2?.85:t===1?.65:.5,this.resize()}resize(){let t=this.gl;if(!t)return;let o=Math.min(window.devicePixelRatio||1,this.quality>=3?2:1.5),n=Math.max(2,Math.floor(this.canvas.clientWidth*o*this.scale)),s=Math.max(2,Math.floor(this.canvas.clientHeight*o*this.scale));this.canvas.width===n&&this.canvas.height===s||(this.canvas.width=n,this.canvas.height=s,t.viewport(0,0,n,s))}render(t,o){if(!this.ok)return;let n=this.gl,s=this.params,l=this.target,y=1-Math.pow(.0016,o);for(let w in l){if(Zn.has(w)){s[w]=l[w];continue}if(w.endsWith("Az")||w==="windDir"){let v=l[w]-s[w];v=((v+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,s[w]+=v*y}else s[w]+=(l[w]-s[w])*y}s.storm>.12?(this.nextBolt===1/0&&(this.nextBolt=t+Math.random()*3e3),t>this.nextBolt&&(this.flash=.3+Math.random()*.45,this.nextBolt=t+900+Math.random()*9e3*(1.15-s.storm))):this.nextBolt=1/0,this.flash*=Math.pow(8e-5,o),this.flash<.002&&(this.flash=0);let g=this.u;n.uniform2f(g.uRes,this.canvas.width,this.canvas.height),n.uniform1f(g.uTime,(t-this.t0)/1e3),n.uniform1i(g.uQuality,this.quality),n.uniform1f(g.uSunAlt,s.sunAlt),n.uniform1f(g.uSunAz,s.sunAz),n.uniform1f(g.uMoonAlt,s.moonAlt),n.uniform1f(g.uMoonAz,s.moonAz),n.uniform1f(g.uMoonPhase,s.moonPhase),n.uniform1f(g.uMoonFrac,s.moonFrac),n.uniform1f(g.uViewAz,s.viewAz),n.uniform1f(g.uCloudLow,s.cloudLow),n.uniform1f(g.uCloudMid,s.cloudMid),n.uniform1f(g.uCloudHigh,s.cloudHigh),n.uniform1f(g.uPrecip,s.precip),n.uniform1f(g.uSnow,s.snow),n.uniform1f(g.uStorm,s.storm),n.uniform1f(g.uFlash,this.flash),n.uniform1f(g.uFog,s.fog),n.uniform1f(g.uWind,s.wind),n.uniform1f(g.uWindDir,s.windDir),n.uniform1f(g.uKp,s.kp),n.uniform1f(g.uLat,s.lat),n.uniform1f(g.uHaze,s.haze),n.uniform1f(g.uCityGlow,s.cityGlow),n.drawArrays(n.TRIANGLES,0,3)}};function Jn(e,t,o){let n=Ho(e,e.VERTEX_SHADER,t),s=Ho(e,e.FRAGMENT_SHADER,o);if(!n||!s)return null;let l=e.createProgram();return e.attachShader(l,n),e.attachShader(l,s),e.linkProgram(l),e.getProgramParameter(l,e.LINK_STATUS)?(e.deleteShader(n),e.deleteShader(s),l):(console.error("[sky] link failed:",e.getProgramInfoLog(l)),null)}function Ho(e,t,o){let n=e.createShader(t);if(e.shaderSource(n,o),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){let s=e.getShaderInfoLog(n);console.error(`[sky] ${t===e.VERTEX_SHADER?"vertex":"fragment"} compile failed:
${s}`);let l=/ERROR:\s*\d+:(\d+)/.exec(s||"");if(l){let y=o.split(`
`),g=+l[1];console.error(y.slice(Math.max(0,g-3),g+2).map((w,v)=>`${Math.max(1,g-2)+v}| ${w}`).join(`
`))}return null}return n}var j=["#3fd0d8","#f07aa6","#f2b45a","#b39dfa","#7fb2f0"],N={good:"#8fdc6a",warn:"#ecd46a",serious:"#f59a5b",crit:"#f47171"},ve="#dde2e8",pe="#b3bfcc",se="#8d9aab",lo="rgba(255,255,255,.055)",Qn="#0f1826",zo="#16212f",Xn="500 12px 'JetBrains Mono', ui-monospace, monospace",$e="500 11.5px 'JetBrains Mono', ui-monospace, monospace",ye="600 11.5px 'Chakra Petch', system-ui, sans-serif";function Ee(e){if(e==null)return pe;let t=[[-20,"#9d8ef5"],[10,"#6aa9f0"],[32,"#3fd0d8"],[50,"#5cd6bc"],[65,"#a2d86a"],[78,"#ecd46a"],[88,"#f59a5b"],[100,"#f47171"],[115,"#f07aa6"]];if(e<=t[0][0])return t[0][1];if(e>=t.at(-1)[0])return t.at(-1)[1];for(let o=0;o<t.length-1;o++){let[n,s]=t[o],[l,y]=t[o+1];if(e>=n&&e<=l)return _e(s,y,(e-n)/(l-n))}return pe}function _e(e,t,o){let n=[1,3,5].map(y=>parseInt(e.slice(y,y+2),16)),s=[1,3,5].map(y=>parseInt(t.slice(y,y+2),16));return`#${n.map((y,g)=>Math.round(Tt(y,s[g],H(o,0,1)))).map(y=>y.toString(16).padStart(2,"0")).join("")}`}function V(e,t){let o=[1,3,5].map(n=>parseInt(e.slice(n,n+2),16));return`rgba(${o[0]},${o[1]},${o[2]},${t})`}var Xe=new Set;function _o(){for(let e of Xe)e.hover=null,e.render();Xe.clear()}var Fo=10;function le(e,t,{onPick:o,inspect:n=!0}={}){let s=e.getContext("2d"),l={canvas:e,ctx:s,hover:null,data:null,draw:t,dirty:!0},y=()=>{let f=Math.min(window.devicePixelRatio||1,2),p=e.clientWidth,T=e.clientHeight;if(!p||!T)return;let M=Math.round(p*f),$=Math.round(T*f);(e.width!==M||e.height!==$)&&(e.width=M,e.height=$),s.setTransform(f,0,0,f,0,0),l.w=p,l.h=T,l.render()};l.render=()=>{if(!(!l.w||!l.h)){s.clearRect(0,0,l.w,l.h);try{t(s,l.w,l.h,l.hover,l.data)}catch(f){console.error("[chart]",f.stack||f)}}},l.update=f=>{l.data=f,l.render()};let g=new ResizeObserver(y);g.observe(e),n&&(e.style.touchAction="pan-y");let w=f=>{let p=e.getBoundingClientRect();return{x:f.clientX-p.left,y:f.clientY-p.top}},v=f=>!!f.pointerType&&f.pointerType!=="mouse",i=(f,p)=>{l.hover={x:f.x,y:f.y,coarse:p},l.render()},u=()=>{Xe.delete(l),l.hover=null,l.render()},S=null,h=f=>{if(!v(f)){i(w(f),!1);return}S&&(S.moved=Math.max(S.moved,Math.hypot(f.clientX-S.cx,f.clientY-S.cy)),n&&i(w(f),!0))},d=f=>{let p=w(f);if(S={x:p.x,y:p.y,cx:f.clientX,cy:f.clientY,moved:0,coarse:v(f)},!S.coarse||!n)return;let T=l.hover;S.dismiss=!!T&&!!T.coarse&&Math.abs(T.x-p.x)<14&&Math.abs(T.y-p.y)<14;for(let M of Xe)M!==l&&(M.hover=null,M.render());Xe.clear(),Xe.add(l),i(p,!0)},m=f=>{let p=S;S=null,p&&(p.coarse&&n&&p.dismiss&&p.moved<Fo&&u(),o&&p.moved<Fo&&o({x:p.x,y:p.y,w:l.w,h:l.h},f))},a=()=>{S&&S.coarse&&n&&u(),S=null},c=f=>{v(f)||(l.hover=null,l.render())};return e.addEventListener("pointermove",h),e.addEventListener("pointerdown",d),e.addEventListener("pointerup",m),e.addEventListener("pointercancel",a),e.addEventListener("pointerleave",c),o&&(e.style.cursor="crosshair"),l.destroy=()=>{g.disconnect(),Xe.delete(l),e.removeEventListener("pointermove",h),e.removeEventListener("pointerdown",d),e.removeEventListener("pointerup",m),e.removeEventListener("pointercancel",a),e.removeEventListener("pointerleave",c)},y(),l}function ke(e,t,o,{width:n=2,glow:s=12,closed:l=!1}={}){if(t.length<2)return;let y=()=>{e.beginPath(),e.moveTo(t[0][0],t[0][1]);for(let g=1;g<t.length;g++)e.lineTo(t[g][0],t[g][1]);l&&e.closePath()};e.lineJoin="round",e.lineCap="round",s&&(e.save(),e.shadowColor=o,e.shadowBlur=s/2,e.strokeStyle=V(o,.55),e.lineWidth=n,y(),e.stroke(),e.restore()),e.strokeStyle=o,e.lineWidth=n,y(),e.stroke()}function Pe(e,t){if(!(t.length<2)){e.moveTo(t[0][0],t[0][1]);for(let o=0;o<t.length-1;o++){let n=t[Math.max(0,o-1)],s=t[o],l=t[o+1],y=t[Math.min(t.length-1,o+2)];e.bezierCurveTo(s[0]+(l[0]-n[0])/6,s[1]+(l[1]-n[1])/6,l[0]-(y[0]-s[0])/6,l[1]-(y[1]-s[1])/6,l[0],l[1])}}}function Ce(e,t,o,n=String,{color:s=lo,label:l=!0}={}){e.save(),e.strokeStyle=s,e.lineWidth=1,e.font=$e,e.fillStyle=se,e.textAlign="right",e.textBaseline="middle";let y=-1e9;for(let{v:g,y:w}of o){if(e.beginPath(),e.moveTo(t.x,Math.round(w)+.5),e.lineTo(t.x+t.w,Math.round(w)+.5),e.stroke(),!l)continue;let v=w-t.y<9?w+6:w-5;Math.abs(v-y)<14||(Ae(e,n(g),t.x+t.w-2,v),y=v)}e.restore()}function Ve(e,t,o,n,s,l,y=3){let g=Math.abs(s-o);if(g<.4)return;let w=Math.min(y,n/2,g);e.beginPath(),e.moveTo(t,s),e.lineTo(t,o+w),e.quadraticCurveTo(t,o,t+w,o),e.lineTo(t+n-w,o),e.quadraticCurveTo(t+n,o,t+n,o+w),e.lineTo(t+n,s),e.closePath(),e.fillStyle=l,e.save(),e.globalAlpha*=.6,e.fill(),e.clip(),e.globalAlpha/=.6,e.fillRect(t,o,n,Math.min(2.5,g)),e.restore()}function Ae(e,t,o,n,s=3){e.save(),e.lineWidth=s,e.lineJoin="round",e.strokeStyle=V(zo,.9),e.strokeText(t,o,n),e.restore(),e.fillText(t,o,n)}function Me(e,t,o,n,s=se,l="left"){e.save(),e.font=ye,e.fillStyle=s,e.textAlign=l,e.textBaseline="top",e.letterSpacing="1.4px",Ae(e,n.toUpperCase(),t,o),e.restore()}function et(e,t,o,n,s,l,y="#3fd0d8",{pin:g=!1}={}){e.save(),e.font=Xn;let i=Math.max(...n.map(m=>e.measureText(m.replace(/\|/g,"  ")).width))+14,u=n.length*13+14-2,S,h;g?(S=t>s/2?4:Math.max(4,s-i-4),h=o<l/2?Math.max(4,l-u-4):4):(S=t+12,h=H(o-u-10,4,l-u-4),S+i>s-4&&(S=t-i-12),S=H(S,4,Math.max(4,s-i-4))),e.fillStyle=V(zo,.94),e.strokeStyle=V(y,.5),e.lineWidth=1;let d=5;e.beginPath(),e.moveTo(S,h+d),e.lineTo(S+d,h),e.lineTo(S+i,h),e.lineTo(S+i,h+u-d),e.lineTo(S+i-d,h+u),e.lineTo(S,h+u),e.closePath(),e.fill(),e.stroke(),e.textBaseline="top",n.forEach((m,a)=>{let[c,f]=m.split("|");e.textAlign="left",e.fillStyle=a===0?y:pe,e.fillText(c,S+7,h+7+a*13),f!=null&&(e.textAlign="right",e.fillStyle=a===0?y:ve,e.fillText(f,S+i-7,h+7+a*13))}),e.restore()}function ea(e,t,o,n,{align:s="left"}={}){e.save(),e.font=ye,e.textBaseline="middle",e.letterSpacing="1.2px";let l=0,y=n.map(w=>{let v=e.measureText(w.label.toUpperCase()).width+16;return l+=v,v}),g=s==="right"?t-l:t;n.forEach((w,v)=>{e.fillStyle=w.color,w.dash?(e.strokeStyle=w.color,e.lineWidth=2,e.setLineDash([3,2]),e.beginPath(),e.moveTo(g,o),e.lineTo(g+9,o),e.stroke(),e.setLineDash([])):e.fillRect(g,o-3,9,3),e.fillStyle=pe,e.textAlign="left",e.fillText(w.label.toUpperCase(),g+13,o),g+=y[v]}),e.restore()}function Bo(e,t,o,n,s){e.save(),e.fillStyle="rgba(8,13,22,.32)";for(let l of o){if(!l.sunset||!l.sunrise)continue;let y=o[o.indexOf(l)+1],g=n(l.sunset),w=y?.sunrise?n(y.sunrise):t.x+t.w,v=H(g,t.x,t.x+t.w),i=H(w,t.x,t.x+t.w);i>v&&e.fillRect(v,t.y,i-v,t.h)}e.restore()}function Ot(e,t,o,n,s,{dash:l=null,flagTop:y=!0}={}){if(e.save(),e.strokeStyle=n,e.lineWidth=1,l&&e.setLineDash(l),e.shadowColor=n,e.shadowBlur=4,e.beginPath(),e.moveTo(Math.round(t)+.5,o.y),e.lineTo(Math.round(t)+.5,o.y+o.h),e.stroke(),e.restore(),s){e.save(),e.font=ye,e.letterSpacing="1.2px";let g=e.measureText(s).width+8,w=H(t-g/2,o.x,o.x+o.w-g),v=y?o.y:o.y+o.h-11;e.fillStyle=n,e.fillRect(w,v,g,11),e.fillStyle=Qn,e.textAlign="center",e.textBaseline="middle",e.fillText(s,w+g/2,v+6),e.restore()}}function Be(e,t=4){return H(Math.floor(e/26),1,t)}function Rt(e,t,o,{gap:n=8,least:s=1}={}){if(e<2||t<=0)return s;let l=t/(e-1);return Math.max(s,Math.ceil((o+n)/Math.max(l,.5)))}function Oe(e,t,o,n,s,l){let y=e.measureText(t).width;return y>l-s?!1:(e.fillText(t,H(o,s+y/2,l-y/2),n),!0)}function vt(e,t,o,n,s=[],{short:l=null}={}){let y=(u,S)=>{e.save(),e.font=ye,e.letterSpacing=u;let h=e.measureText(String(S).toUpperCase()).width;return e.restore(),h},g=(u,S)=>y("1.4px",u)+S.reduce((h,d)=>h+y("1.2px",d.label)+16,0)+14,w=s.map(u=>u.short?{...u,label:u.short}:u),[v,i]=[[n,s],[n,w],[l??n,w],[l??n,[]]].find(([u,S])=>g(u,S)<=t.w)??[l??n,[]];Me(e,t.x+2,o,v),i.length&&ea(e,t.x+t.w,o+5,i,{align:"right"})}function We(e,t,o=4){if(!Number.isFinite(e)||!Number.isFinite(t)||e===t)return[e||0];let s=(t-e)/o,l=Math.pow(10,Math.floor(Math.log10(s))),y=s/l,g=(y<1.5?1:y<3?2:y<7?5:10)*l,w=[];for(let v=Math.ceil(e/g)*g;v<=t+1e-9;v+=g)w.push(+v.toFixed(6));return w}function je(e,t,o,n,{value:s,min:l=0,max:y=100,color:g=j[0],label:w="",unit:v="",bands:i=null,sub:u="",decimals:S=0,ticks:h=5}){let d=Math.PI*.75,m=Math.PI*2.25,a=s==null?0:H((s-l)/(y-l),0,1),c=d+(m-d)*a;if(e.save(),e.lineCap="butt",e.beginPath(),e.arc(t,o,n,d,m),e.strokeStyle="rgba(255,255,255,.07)",e.lineWidth=6,e.stroke(),i)for(let M of i){let $=H((M.from-l)/(y-l),0,1),k=H((M.to-l)/(y-l),0,1);k<=$||(e.beginPath(),e.arc(t,o,n+6,d+(m-d)*$,d+(m-d)*k),e.strokeStyle=V(M.color,.55),e.lineWidth=2.5,e.stroke())}e.strokeStyle="rgba(255,255,255,.14)",e.lineWidth=1;for(let M=0;M<=h;M++){let $=d+(m-d)*(M/h),k=Math.cos($),L=Math.sin($);e.beginPath(),e.moveTo(t+k*(n-5),o+L*(n-5)),e.lineTo(t+k*(n-10),o+L*(n-10)),e.stroke()}if(s!=null&&a>.001){e.save(),e.shadowColor=g,e.shadowBlur=7,e.beginPath(),e.arc(t,o,n,d,c),e.strokeStyle=g,e.lineWidth=6,e.stroke(),e.restore();let M=Math.cos(c),$=Math.sin(c);e.beginPath(),e.arc(t+M*n,o+$*n,3.2,0,Math.PI*2),e.fillStyle=ve,e.shadowColor=g,e.shadowBlur=5,e.fill(),e.shadowBlur=0}e.textAlign="center",e.textBaseline="alphabetic",e.fillStyle=ve,e.font=`700 ${Math.round(n*.62)}px 'JetBrains Mono', monospace`;let f=s==null?"--":s.toFixed(S),p=o+n*.18,T=e.measureText(f).actualBoundingBoxDescent;if(e.fillText(f,t,p),v){e.font=$e,e.fillStyle=pe;let M=e.measureText(v).actualBoundingBoxAscent;e.fillText(v,t,Math.max(o+n*.46,p+T+M+3))}w&&(e.font=ye,e.fillStyle=se,e.letterSpacing="1.4px",e.fillText(w.toUpperCase(),t,o+n+15)),u&&(e.font=ye,e.fillStyle=g,e.letterSpacing="1.2px",Ae(e,u.toUpperCase(),t,o-n*.42)),e.restore()}function Wo(e,t,o,{color:n=j[0],fill:s=!0,width:l=1.8,min:y=null,max:g=null,glow:w=8}){let v=o.filter(d=>d!=null);if(v.length<2)return;let i=y??Math.min(...v),S=(g??Math.max(...v))-i||1,h=o.map((d,m)=>[t.x+m/(o.length-1)*t.w,t.y+t.h-((d??i)-i)/S*t.h]);if(s){e.save(),e.beginPath(),Pe(e,h),e.lineTo(h.at(-1)[0],t.y+t.h),e.lineTo(h[0][0],t.y+t.h),e.closePath();let d=e.createLinearGradient(0,t.y,0,t.y+t.h);d.addColorStop(0,V(n,.34)),d.addColorStop(1,V(n,0)),e.fillStyle=d,e.fill(),e.restore()}return e.save(),w&&(e.shadowColor=n,e.shadowBlur=w/2),e.beginPath(),Pe(e,h),e.strokeStyle=n,e.lineWidth=l,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore(),h}function Uo(e,t,o,n,{dir:s,speed:l,gust:y,color:g=j[0]}){e.save(),e.strokeStyle="rgba(255,255,255,.09)",e.lineWidth=1,e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.stroke(),e.font=ye,e.fillStyle=se,e.textAlign="center",e.textBaseline="middle";for(let[u,S]of[["N",-90],["E",0],["S",90],["W",180]]){let h=S*Math.PI/180;e.fillText(u,t+Math.cos(h)*(n+8),o+Math.sin(h)*(n+8))}for(let u=0;u<16;u++){let S=(u*22.5-90)*Math.PI/180,h=u%4===0;e.strokeStyle=h?"rgba(255,255,255,.20)":"rgba(255,255,255,.09)",e.beginPath(),e.moveTo(t+Math.cos(S)*n,o+Math.sin(S)*n),e.lineTo(t+Math.cos(S)*(n-(h?7:4)),o+Math.sin(S)*(n-(h?7:4))),e.stroke()}if(s!=null){let u=(s-90+180)*Math.PI/180,S=n-10;e.save(),e.translate(t,o),e.rotate(u),e.shadowColor=g,e.shadowBlur=6,e.fillStyle=g,e.beginPath(),e.moveTo(S,0),e.lineTo(S-9,-5.5),e.lineTo(S-6,0),e.lineTo(S-9,5.5),e.closePath(),e.fill(),e.strokeStyle=g,e.lineWidth=2,e.beginPath(),e.moveTo(-S*.55,0),e.lineTo(S-7,0),e.stroke(),e.restore()}e.textAlign="center",e.textBaseline="alphabetic",e.fillStyle=ve,e.font=`700 ${Math.round(n*.44)}px 'JetBrains Mono', monospace`;let w=l==null?"--":String(Math.round(l)),v=o+n*.06,i=e.measureText(w).actualBoundingBoxDescent;e.fillText(w,t,v),e.font=$e,e.fillStyle=pe,e.fillText("mph",t,Math.max(o+n*.3,v+i+e.measureText("mph").actualBoundingBoxAscent+3)),y!=null&&y>(l??0)+1&&(e.font=$e,e.fillStyle=N.serious,e.fillText(`G${Math.round(y)}`,t,o-n*.26)),e.restore()}function Nt(e,t,o,n,s,l){e.save(),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.fillStyle="#16212f",e.fill(),e.strokeStyle="rgba(127,178,240,.22)",e.lineWidth=1,e.stroke();let y=1-2*H(l,0,1),g=s<.5;e.save(),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.clip(),e.beginPath();let w=48;for(let i=0;i<=w;i++){let u=-1+2*i/w,S=y*Math.sqrt(Math.max(0,1-u*u)),h=t+(g?S:-S)*n;i===0?e.moveTo(h,o+u*n):e.lineTo(h,o+u*n)}for(let i=w;i>=0;i--){let u=-1+2*i/w;e.lineTo(t+(g?1:-1)*Math.sqrt(Math.max(0,1-u*u))*n,o+u*n)}e.closePath();let v=e.createRadialGradient(t-n*.25,o-n*.25,n*.1,t,o,n);v.addColorStop(0,"#f2f6ff"),v.addColorStop(1,"#b9c6da"),e.fillStyle=v,e.shadowColor="rgba(200,225,255,.7)",e.shadowBlur=n*.5,e.fill(),e.shadowBlur=0,e.globalCompositeOperation="multiply",e.fillStyle="rgba(150,165,190,.55)";for(let[i,u,S]of[[-.28,-.2,.26],[.1,-.34,.18],[.22,.1,.22],[-.15,.3,.16],[-.42,.12,.13]])e.beginPath(),e.arc(t+i*n,o+u*n,S*n,0,Math.PI*2),e.fill();e.restore(),e.restore()}function Go(e,t,o,n,{sunTrack:s=[],moonTrack:l=[],sun:y=null,moon:g=null,iss:w=null,night:v=0}){let i=(d,m)=>{let a=(1-H(m,0,90)/90)*n,c=(d-90)*Math.PI/180;return[t+Math.cos(c)*a,o+Math.sin(c)*a]};e.save();let u=e.createRadialGradient(t,o,0,t,o,n);u.addColorStop(0,v>.5?"rgba(6,12,30,.85)":"rgba(10,40,72,.55)"),u.addColorStop(1,v>.5?"rgba(2,4,12,.6)":"rgba(6,20,40,.4)"),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.fillStyle=u,e.fill(),e.strokeStyle="rgba(255,255,255,.10)",e.lineWidth=1;for(let d of[30,60])e.beginPath(),e.arc(t,o,(1-d/90)*n,0,Math.PI*2),e.stroke();e.strokeStyle="rgba(63,208,216,.28)",e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.stroke(),e.font=ye,e.textAlign="center",e.textBaseline="middle";for(let[d,m]of[["N",0],["E",90],["S",180],["W",270]]){let[a,c]=i(m,0);e.strokeStyle="rgba(255,255,255,.07)",e.beginPath(),e.moveTo(t,o),e.lineTo(a,c),e.stroke();let[f,p]=i(m,-9);e.fillStyle=se,e.fillText(d,f,p)}let S=(d,m,a)=>{let c=[],f=()=>{c.length>1&&(e.save(),a&&e.setLineDash(a),ke(e,c,m,{width:1.5,glow:6}),e.restore()),c=[]};for(let p of d){if(p.alt<0){f();continue}c.push(i(p.az,p.alt))}f()};S(s,"#f2b45a",null),S(l,"#7fb2f0",[3,3]);let h=(d,m,a)=>{if(!d||d.alt<-2)return;let[c,f]=i(d.az,Math.max(0,d.alt));e.save(),e.shadowColor=m,e.shadowBlur=8,e.fillStyle=m,e.beginPath(),e.arc(c,f,a,0,Math.PI*2),e.fill(),e.restore(),d.alt<0&&(e.strokeStyle=V(m,.5),e.setLineDash([2,2]),e.beginPath(),e.arc(c,f,a+3,0,Math.PI*2),e.stroke(),e.setLineDash([]))};if(h(g,"#c9d8f5",5),h(y,"#efc865",6.5),w){let[d,m]=i(w.az,Math.max(0,w.alt));e.save(),e.strokeStyle="#8fdc6a",e.lineWidth=1.5,e.shadowColor="#8fdc6a",e.shadowBlur=5,e.beginPath(),e.arc(d,m,4,0,Math.PI*2),e.stroke(),e.beginPath(),e.moveTo(d-7,m),e.lineTo(d+7,m),e.stroke(),e.restore()}e.restore()}var tt=8,qo=8,Vo=16,jo=15;function Ko(e){e.innerHTML=`
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
  `;let t=e.querySelector(".tl-canvas"),o=e.querySelector(".tl-when b"),n=e.querySelector(".tl-when span"),s=e.querySelector(".tl-delta"),l=e.querySelector(".tl-play"),y=!1,g=le(t,v,{inspect:!1});function w(d){let{lo:m,hi:a}=r.span,c=d-tt-qo;return{lo:m,hi:a,plotW:c,xOf:f=>tt+(f-m)/(a-m||1)*c,tOf:f=>m+(f-tt)/c*(a-m||1)}}function v(d,m,a,c){let f=r.hours;if(!f?.length)return;let p=w(m),T=r.fmt,M={x:tt,y:Vo,w:p.plotW,h:a-Vo-jo};d.save(),d.fillStyle="rgba(8,13,22,.4)";for(let B=0;B<r.days.length;B++){let Z=r.days[B],Q=r.days[B+1];if(!Z.sunset)continue;let J=H(p.xOf(Z.sunset),M.x,M.x+M.w),Y=H(Q?.sunrise?p.xOf(Q.sunrise):M.x+M.w,M.x,M.x+M.w);Y>J&&d.fillRect(J,M.y,Y-J,M.h)}d.restore();let $=f.map(B=>B.temp).filter(B=>B!=null),k=Math.min(...$),L=Math.max(...$),R=B=>M.y+M.h*.92-(B-k)/(L-k||1)*M.h*.72,A=f.filter(B=>B.temp!=null).map(B=>[p.xOf(B.t),R(B.temp)]);d.save(),d.beginPath(),Pe(d,A),d.lineTo(A.at(-1)[0],M.y+M.h),d.lineTo(A[0][0],M.y+M.h),d.closePath();let C=d.createLinearGradient(0,M.y,0,M.y+M.h);C.addColorStop(0,V(Ee(L),.34)),C.addColorStop(1,V(Ee(k),.03)),d.fillStyle=C,d.fill(),d.restore();let O=d.createLinearGradient(tt,0,tt+p.plotW,0);for(let B=0;B<=12;B++){let Z=f[Math.round(B/12*(f.length-1))];O.addColorStop(B/12,Ee(Z?.temp))}d.save(),d.shadowColor=V(j[0],.8),d.shadowBlur=4,d.beginPath(),Pe(d,A),d.strokeStyle=O,d.lineWidth=1.8,d.lineJoin="round",d.stroke(),d.restore();let E=Math.max(...f.map(B=>B.precip??0),.02);d.save();for(let B of f){let Z=B.precip??0;if(Z<.001)continue;let Q=p.xOf(B.t),J=H(Z/E,.08,1)*M.h*.3;d.fillStyle=V(j[4],.75),d.fillRect(Q-.7,M.y+M.h-J,1.6,J)}d.restore(),d.save(),d.font=ye,d.letterSpacing="1.2px",d.textBaseline="top";let D=r.days.length>1?Math.abs(p.xOf(r.days[1].t)-p.xOf(r.days[0].t)):M.w,F=34,W=Math.max(1,Math.ceil(F/Math.max(1,D))),U=0;for(let B of r.days){let Z=p.xOf(B.t),Q=U++%W===0;Z<M.x||Z>M.x+M.w||(d.strokeStyle=Q?"rgba(255,255,255,.10)":"rgba(255,255,255,.05)",d.lineWidth=1,d.beginPath(),d.moveTo(Math.round(Z)+.5,M.y),d.lineTo(Math.round(Z)+.5,M.y+M.h),d.stroke(),!(!Q||Z+F>M.x+M.w)&&(d.fillStyle=se,d.textAlign="left",d.fillText(T.weekday(B.t).toUpperCase(),Z+3,a-jo+3)))}d.restore();for(let B of r.alerts){let Z=Date.parse(B.effective||B.onset||0),Q=Date.parse(B.expires||B.ends||0);if(!Z||!Q)continue;let J=H(p.xOf(Z),M.x,M.x+M.w),Y=H(p.xOf(Q),M.x,M.x+M.w);Y<=J||(d.fillStyle=V(N.crit,.55),d.fillRect(J,M.y-4,Y-J,3))}let P=Date.now(),G=p.xOf(P);if(G>=M.x&&G<=M.x+M.w&&(d.save(),d.strokeStyle=V(N.good,.85),d.lineWidth=1,d.setLineDash([2,3]),d.shadowColor=N.good,d.shadowBlur=4,d.beginPath(),d.moveTo(Math.round(G)+.5,M.y-4),d.lineTo(Math.round(G)+.5,M.y+M.h),d.stroke(),d.restore()),c&&!y&&c.x>M.x&&c.x<M.x+M.w){let B=p.tOf(c.x);d.save(),d.strokeStyle="rgba(255,255,255,.22)",d.lineWidth=1,d.beginPath(),d.moveTo(Math.round(c.x)+.5,M.y),d.lineTo(Math.round(c.x)+.5,M.y+M.h),d.stroke(),d.font=$e,d.fillStyle=pe,d.textAlign=c.x>m-70?"right":"left",d.textBaseline="top",d.fillText(`${T.weekday(B)} ${T.hm(B)}`,c.x+(c.x>m-70?-5:5),2),d.restore()}let te=p.xOf(r.cursor);d.save(),d.strokeStyle=j[1],d.lineWidth=1.5,d.shadowColor=j[1],d.shadowBlur=7,d.beginPath(),d.moveTo(Math.round(te)+.5,M.y-6),d.lineTo(Math.round(te)+.5,M.y+M.h+3),d.stroke(),d.fillStyle=j[1],d.beginPath(),d.moveTo(te,M.y-10),d.lineTo(te+5,M.y-16),d.lineTo(te-5,M.y-16),d.closePath(),d.fill(),d.restore()}let i=d=>{let m=t.getBoundingClientRect(),a=w(m.width);r.playing=!1,S(),r.scrubTo(a.tOf(H(d-m.left,tt,m.width-qo)))};t.addEventListener("pointerdown",d=>{y=!0,t.setPointerCapture(d.pointerId),i(d.clientX)}),t.addEventListener("pointermove",d=>{y&&i(d.clientX)});let u=d=>{if(y){y=!1;try{t.releasePointerCapture(d.pointerId)}catch{}}};t.addEventListener("pointerup",u),t.addEventListener("pointercancel",u),t.style.cursor="ew-resize",e.addEventListener("click",d=>{let m=d.target.closest("button");if(!m)return;if(m.dataset.rate){r.playRate=+m.dataset.rate,e.querySelectorAll("[data-rate]").forEach(c=>c.classList.toggle("on",+c.dataset.rate===r.playRate));return}let a=m.dataset.act;a==="now"?r.toNow():a==="back"?(r.playing=!1,r.scrubTo(r.cursor-36e5)):a==="fwd"?(r.playing=!1,r.scrubTo(r.cursor+36e5)):a==="play"&&(r.playing=!r.playing,r.playing&&r.view!=="radar"&&(r.following=!1),r.playing&&r.cursor>=r.span.hi-6e4&&r.setCursor(Date.now()),r.emit("play",r.playing)),S()});function S(){l.textContent=r.playing?"\u275A\u275A":"\u25B6",l.classList.toggle("on",r.playing),e.querySelector(".tl-now").classList.toggle("on",r.atNow)}function h(){let d=r.fmt,m=r.cursor;o.textContent=d.hm12(m),n.textContent=`${d.weekday(m)} ${d.monthDay(m)}`;let a=m-Date.now(),c=Math.round(Math.abs(a)/6e4);if(c<3)s.textContent="NOW",s.className="tl-delta now";else{let f=Math.floor(c/60),p=c%60,T=f>=24?`${Math.floor(f/24)}d ${f%24}h`:f?`${f}h ${p}m`:`${p}m`;s.textContent=a>0?`+${T}`:`\u2212${T}`,s.className="tl-delta "+(a>0?"fwd":"back")}S()}return r.on("cursor",()=>{h(),g.render()}),r.on("data",()=>{h(),g.render()}),r.on("play",S),e.querySelector('[data-rate="1"]').classList.add("on"),h(),{render:()=>g.render(),tick(d){if(!r.playing||r.view==="radar")return;let m=r.cursor+d*1e3*3600*r.playRate;m>=r.span.hi?(r.setCursor(r.span.hi),r.playing=!1,r.emit("play",!1),S()):r.setCursor(m)}}}function Ht(e,t,o,n,s){let{hours:l,days:y,span:g,cursor:w,now:v,tf:i,panels:u=["temp","pop"],showAxis:S=!0}=s;if(!l?.length)return;let h=4,d=30,m=14,a=S?30:4,c=t-h-d;if(c<30)return;let f=l.filter(E=>E.t>=g.lo-36e5&&E.t<=g.hi+36e5);if(f.length<2)return;let p=E=>h+(E-g.lo)/(g.hi-g.lo)*c,T=E=>g.lo+(E-h)/c*(g.hi-g.lo),M={temp:1,pop:.42,wind:.42,cloud:.3,pressure:.42,uv:.36,cape:.36},$=u.reduce((E,D)=>E+(M[D]||.4),0),k=u.length>2?16:9,L=o-m-a-(u.length-1)*k,R=m,A={};for(let E of u){let D=L*(M[E]||.4)/$;A[E]={x:h,y:R,w:c,h:D},R+=D+k}let C={x:h,y:m,w:c,h:o-m-a};if(Bo(e,C,y||[],p),y?.length){e.save(),e.strokeStyle="rgba(255,255,255,.07)",e.lineWidth=1,e.font=ye,e.letterSpacing="1.2px",e.textBaseline="top";for(let E of y){let D=p(E.t);D<h-1||D>h+c||(e.beginPath(),e.moveTo(Math.round(D)+.5,m),e.lineTo(Math.round(D)+.5,m+C.h),e.stroke(),S&&(e.fillStyle=se,e.textAlign="left",e.fillText(i.weekday(E.t).toUpperCase(),D+3,o-a+17)))}e.restore()}let O=[];if(A.temp){let E=A.temp,D=f.map(J=>J.temp).filter(J=>J!=null),F=f.map(J=>J.feels).filter(J=>J!=null),W=D.concat(F),U=Math.min(...W)-2,P=Math.max(...W)+2,G=J=>E.y+E.h-(J-U)/(P-U)*E.h;if(Ce(e,E,We(U,P,Be(E.h,3)).map(J=>({v:J,y:G(J)})),J=>`${Math.round(J)}\xB0`),F.length>1){e.save(),e.setLineDash([4,3]);let J=f.filter(Y=>Y.feels!=null).map(Y=>[p(Y.t),G(Y.feels)]);ke(e,J,V(j[1],.75),{width:1.5,glow:6}),e.restore()}let te=f.filter(J=>J.temp!=null).map(J=>[p(J.t),G(J.temp)]);e.save(),e.beginPath(),Pe(e,te),e.lineTo(te.at(-1)[0],E.y+E.h),e.lineTo(te[0][0],E.y+E.h),e.closePath();let B=e.createLinearGradient(0,E.y,0,E.y+E.h);B.addColorStop(0,V(Ee(P),.3)),B.addColorStop(1,V(Ee(U),.02)),e.fillStyle=B,e.fill(),e.restore();let Z=e.createLinearGradient(h,0,h+c,0);for(let J=0;J<=8;J++){let Y=f[Math.round(J/8*(f.length-1))];Z.addColorStop(J/8,Ee(Y?.temp))}e.save(),e.shadowColor=V(j[0],.9),e.shadowBlur=6,e.beginPath(),Pe(e,te),e.strokeStyle=Z,e.lineWidth=2.2,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore(),e.save(),e.font=$e,e.textAlign="center",e.textBaseline="bottom";let Q=e.measureText("100\xB0").width+6;for(let J of y||[]){let Y=f.filter(de=>i.isoDate(de.t)===i.isoDate(J.t)&&de.temp!=null);if(Y.length<3)continue;let ue=Y.reduce((de,b)=>b.temp>de.temp?b:de),Re=Y.reduce((de,b)=>b.temp<de.temp?b:de);for(let[de,b,I]of[[ue,-6,"bottom"],[Re,13,"top"]]){let q=p(de.t),z=e.measureText(`${Math.round(de.temp)}\xB0`).width;if(q-z/2<h+4||q+z/2>h+c-Q)continue;let _=G(de.temp)+b,K=I==="top"?_+9>E.y+E.h:_-9<E.y;e.textBaseline=K?I==="top"?"bottom":"top":I,e.fillStyle=Ee(de.temp),Ae(e,`${Math.round(de.temp)}\xB0`,q,K?G(de.temp)-b:_)}}e.restore(),vt(e,E,E.y-11,"temperature \xB0F",[{label:"actual",color:j[0]},{label:"feels like",short:"feels",color:j[1],dash:!0}],{short:"temp \xB0F"}),O.push({key:"temp",box:E,yOf:G})}if(A.pop){let E=A.pop,D=G=>E.y+E.h-H(G,0,100)/100*E.h;Ce(e,E,[50,100].map(G=>({v:G,y:D(G)})),G=>`${G}%`);let F=f.map(G=>[p(G.t),D(G.pop??0)]);e.save(),e.beginPath(),Pe(e,F),e.lineTo(F.at(-1)[0],E.y+E.h),e.lineTo(F[0][0],E.y+E.h),e.closePath();let W=e.createLinearGradient(0,E.y,0,E.y+E.h);W.addColorStop(0,V(j[4],.55)),W.addColorStop(1,V(j[4],.04)),e.fillStyle=W,e.fill(),e.restore(),ke(e,F,j[4],{width:1.6,glow:7}),e.save(),e.font=$e,e.textAlign="center",e.textBaseline="bottom",e.fillStyle=j[0];let U=-999,P=e.measureText("100%").width+6;for(let G=1;G<f.length-1;G++){let te=f[G];if((te.precip??0)<.02||(te.precip??0)<=(f[G-1].precip??0)||(te.precip??0)<(f[G+1].precip??0))continue;let B=p(te.t),Z=e.measureText(`${te.precip.toFixed(2)}"`).width;B-U<46||B-Z/2<h+4||B+Z/2>h+c-P||(e.fillText(`${te.precip.toFixed(2)}"`,B,D(te.pop??0)-4),U=B)}e.restore(),Me(e,E.x+2,E.y-11,"precip probability"),O.push({key:"pop",box:E,yOf:D})}if(A.wind){let E=A.wind,D=Math.max(...f.map(P=>P.gust??P.wind??0),10)*1.12,F=P=>E.y+E.h-H(P,0,D)/D*E.h;Ce(e,E,We(0,D,Be(E.h,2)).map(P=>({v:P,y:F(P)})),P=>String(Math.round(P)));let W=f.map(P=>[p(P.t),F(P.gust??P.wind??0)]);e.save(),e.beginPath(),Pe(e,W),e.lineTo(W.at(-1)[0],E.y+E.h),e.lineTo(W[0][0],E.y+E.h),e.closePath(),e.fillStyle=V(N.serious,.16),e.fill(),e.restore(),ke(e,W,V(N.serious,.85),{width:1.2,glow:5}),ke(e,f.map(P=>[p(P.t),F(P.wind??0)]),j[3],{width:1.8,glow:8}),e.save(),e.strokeStyle=V(j[3],.55),e.lineWidth=1;let U=Math.max(1,Math.round(f.length/(c/26)));for(let P=0;P<f.length;P+=U){let G=f[P];if(G.windDir==null)continue;let te=p(G.t),B=E.y+E.h-5,Z=(G.windDir-90+180)*Math.PI/180;e.save(),e.translate(te,B),e.rotate(Z),e.beginPath(),e.moveTo(-4,0),e.lineTo(4,0),e.moveTo(4,0),e.lineTo(1.5,-2),e.moveTo(4,0),e.lineTo(1.5,2),e.stroke(),e.restore()}e.restore(),vt(e,E,E.y-11,"wind mph",[{label:"sustained",short:"wind",color:j[3]},{label:"gusts",color:N.serious}],{short:"wind"}),O.push({key:"wind",box:E,yOf:F})}if(A.cloud){let E=A.cloud,D=f.length,F=Math.max(1,c/D),W=[["cloudHigh",V(j[4],.55)],["cloudMid",V(j[0],.5)],["cloudLow",V(ve,.45)]];f.forEach((U,P)=>{let G=h+P*c/D,te=E.y,B=E.h/3;W.forEach(([Z,Q],J)=>{let Y=H((U[Z]??0)/100,0,1);e.fillStyle=Q,e.fillRect(G,te+(B-2)*(1-Y),Math.max(1,F-.5),(B-2)*Y),te+=B})}),e.save(),e.font=ye,e.textAlign="right",e.textBaseline="middle",["HIGH","MID","LOW"].forEach((U,P)=>{let G=E.y+E.h/3*(P+.5);e.fillStyle="rgba(22,33,47,.75)",e.fillRect(E.x+E.w-30,G-5,30,10),e.fillStyle=se,Ae(e,U,E.x+E.w-2,G)}),e.restore(),Me(e,E.x+2,E.y-11,"cloud decks %"),O.push({key:"cloud",box:E})}if(A.pressure){let E=A.pressure,D=f.map(P=>P.pressure).filter(P=>P!=null),F=Math.min(...D)-1,W=Math.max(...D)+1,U=P=>E.y+E.h-(P-F)/(W-F)*E.h;Ce(e,E,We(F,W,Be(E.h,2)).map(P=>({v:P,y:U(P)})),P=>(P*.02953).toFixed(2)),ke(e,f.filter(P=>P.pressure!=null).map(P=>[p(P.t),U(P.pressure)]),j[3],{width:1.8,glow:8}),Me(e,E.x+2,E.y-11,"pressure inHg"),O.push({key:"pressure",box:E,yOf:U})}if(A.uv){let E=A.uv,D=U=>E.y+E.h-H(U,0,12)/12*E.h;Ce(e,E,[3,6,8,11].map(U=>({v:U,y:D(U)})),String);let F=f.length,W=Math.max(1,c/F-1);f.forEach((U,P)=>{let G=U.uv??0;if(G<=.05)return;let te=h+P*c/F,B=G<3?N.good:G<6?N.warn:G<8?N.serious:G<11?N.crit:j[3];Ve(e,te,D(G),W,E.y+E.h,V(B,.8))}),Me(e,E.x+2,E.y-11,"uv index"),O.push({key:"uv",box:E,yOf:D})}if(A.cape){let E=A.cape,D=Math.max(...f.map(U=>U.cape??0),500)*1.1,F=U=>E.y+E.h-H(U,0,D)/D*E.h;Ce(e,E,We(0,D,Be(E.h,2)).map(U=>({v:U,y:F(U)})),U=>String(Math.round(U)));let W=f.map(U=>[p(U.t),F(U.cape??0)]);e.save(),e.beginPath(),Pe(e,W),e.lineTo(W.at(-1)[0],E.y+E.h),e.lineTo(W[0][0],E.y+E.h),e.closePath(),e.fillStyle=V(N.crit,.18),e.fill(),e.restore(),ke(e,W,N.crit,{width:1.6,glow:7}),Me(e,E.x+2,E.y-11,"CAPE J/kg"),O.push({key:"cape",box:E,yOf:F})}if(S){e.save(),e.font=$e,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let E=(g.hi-g.lo)/36e5,D=E>200?24:E>96?12:E>40?6:E>16?3:1,F=e.measureText("00:00").width+8,W=c/Math.max(E,1),U=[1,3,6,12,24,48].filter(P=>P>=D).find(P=>P*W>=F)??48;for(let P of f){let G=i.hourOfDay(P.t);if(Math.abs(G-Math.round(G))>.01||Math.round(G)%U!==0)continue;let te=p(P.t);te<h+10||te>h+c-10||e.fillText(i.hm(P.t),te,o-a+4)}e.restore()}if(v!=null&&v>=g.lo&&v<=g.hi&&Ot(e,p(v),C,V(N.good,.9),"NOW",{dash:[3,3]}),w!=null&&Math.abs(w-(v??w))>9e4&&w>=g.lo&&w<=g.hi&&Ot(e,p(w),C,j[1],null),n&&n.x>h&&n.x<h+c){let E=T(n.x),D=Yo(f,E);if(D){let F=p(D.t);e.save(),e.strokeStyle="rgba(255,255,255,.35)",e.setLineDash([2,3]),e.lineWidth=1,e.beginPath(),e.moveTo(Math.round(F)+.5,m),e.lineTo(Math.round(F)+.5,m+C.h),e.stroke(),e.restore();for(let U of O){if(!U.yOf)continue;let P=U.key==="temp"?D.temp:U.key==="pop"?D.pop??0:U.key==="wind"?D.wind:U.key==="pressure"?D.pressure:U.key==="uv"?D.uv:U.key==="cape"?D.cape:null;P!=null&&(e.save(),e.fillStyle=ve,e.shadowColor=j[0],e.shadowBlur=5,e.beginPath(),e.arc(F,U.yOf(P),3.5,0,Math.PI*2),e.fill(),e.restore())}let W=[`${i.weekday(D.t)} ${i.hm(D.t)}|`];A.temp&&(W.push(`TEMP|${x.temp(D.temp)}`),W.push(`FEELS|${x.temp(D.feels)}`)),A.pop&&(W.push(`RAIN CHANCE|${x.pct(D.pop)}`),(D.precip??0)>.001&&W.push(`AMOUNT|${x.inches(D.precip)}"`)),A.wind&&W.push(`WIND|${x.wind(D.wind)} ${me(D.windDir)}`),A.pressure&&W.push(`PRESSURE|${x.pressure(D.pressure)}`),A.uv&&W.push(`UV|${D.uv?.toFixed(1)??"--"}`),A.cape&&W.push(`CAPE|${Math.round(D.cape??0)}`),W.push(`SKY|${Qe(Math.round(D.code??0)).label}`),et(e,F,n.y,W,t,o,"#3fd0d8",{pin:n.coarse})}}return{xOf:p,tOf:T,boxes:A}}function Yo(e,t){let o=null,n=1/0;for(let s of e){let l=Math.abs(s.t-t);l<n&&(n=l,o=s)}return o}function xo(e,t,o,n,{rows:s,tf:l,now:y}){if(!s?.length)return;let g=4,w=34,v=16,i=20,u={x:g,y:v,w:t-g-w,h:o-v-i};if(u.w<30||u.h<20)return;let S=Math.min(...s.map($=>$.min)),h=Math.max(...s.map($=>$.max)),d=S-2,m=h+2,a=$=>u.x+($-s[0].t)/(s.at(-1).t-s[0].t)*u.w,c=$=>u.y+u.h-($-d)/(m-d)*u.h;Ce(e,u,We(d,m,Be(u.h,4)).map($=>({v:$,y:c($)})),$=>`${Math.round($)}\xB0`),e.save(),e.beginPath(),s.forEach(($,k)=>k?e.lineTo(a($.t),c($.max)):e.moveTo(a($.t),c($.max)));for(let $=s.length-1;$>=0;$--)e.lineTo(a(s[$].t),c(s[$].min));e.closePath();let f=e.createLinearGradient(u.x,0,u.x+u.w,0);f.addColorStop(0,V(j[0],.3)),f.addColorStop(1,V(j[0],.1)),e.fillStyle=f,e.fill(),e.strokeStyle=V(j[0],.35),e.lineWidth=1,e.stroke(),e.restore(),ke(e,s.map($=>[a($.t),c($.mean)]),j[0],{width:2,glow:10}),e.save(),e.strokeStyle=lo,e.font=$e,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let p="",T=e.measureText("WED").width+8,M=-1e9;for(let $ of s){let k=l.isoDate($.t);if(k===p)continue;p=k;let L=a($.t);e.beginPath(),e.moveTo(L+.5,u.y),e.lineTo(L+.5,u.y+u.h),e.stroke(),!(L<u.x+12||L>u.x+u.w-12||L-M<T)&&(e.fillText(l.weekday($.t).toUpperCase(),L,o-i+5),M=L)}if(e.restore(),y>=s[0].t&&y<=s.at(-1).t&&Ot(e,a(y),u,V(N.good,.9),"NOW",{dash:[3,3]}),vt(e,u,3,"model agreement \xB0F",[{label:"ensemble mean",short:"mean",color:j[0]},{label:"model range",short:"range",color:V(j[0],.35)}],{short:"model spread \xB0F"}),n&&n.x>u.x&&n.x<u.x+u.w){let $=s[0].t+(n.x-u.x)/u.w*(s.at(-1).t-s[0].t),k=Yo(s,$);if(k){let L=a(k.t);e.save(),e.strokeStyle="rgba(255,255,255,.3)",e.setLineDash([2,3]),e.beginPath(),e.moveTo(L+.5,u.y),e.lineTo(L+.5,u.y+u.h),e.stroke(),e.restore();let R=k.spread<2?"HIGH":k.spread<5?"MODERATE":k.spread<9?"LOW":"VERY LOW";et(e,L,n.y,[`${l.weekday(k.t)} ${l.hm(k.t)}|`,`MEAN|${x.tempP(k.mean)}`,`RANGE|${x.temp(k.min)}\u2013${x.temp(k.max)}`,`SPREAD|${k.spread.toFixed(1)}\xB0`,`CONFIDENCE|${R}`,k.precipAgree!=null?`MODELS WET|${Math.round(k.precipAgree*100)}%`:null].filter(Boolean),t,o,"#3fd0d8",{pin:n.coarse})}}}function Zo(e,t,o,n,{days:s,climate:l,tf:y,doyOf:g}){if(!s?.length||!l?.doy?.length)return;let w=4,v=34,i=16,u=20,S={x:w,y:i,w:t-w-v,h:o-i-u};if(S.w<40||S.h<30)return;let h=s.map(k=>{let L=l.doy[g(k.t)];return L?{...k,c:L}:null}).filter(Boolean);if(!h.length)return;let d=h.flatMap(k=>[k.c.recordHigh,k.c.recordLow,k.tmax,k.tmin]).filter(k=>k!=null),m=Math.min(...d)-3,a=Math.max(...d)+3,c=h.length,f=S.w/c,p=k=>S.x+f*(k+.5),T=k=>S.y+S.h-(k-m)/(a-m)*S.h;Ce(e,S,We(m,a,Be(S.h,4)).map(k=>({v:k,y:T(k)})),k=>`${Math.round(k)}\xB0`),e.save(),e.beginPath(),h.forEach((k,L)=>L?e.lineTo(p(L),T(k.c.recordHigh)):e.moveTo(p(L),T(k.c.recordHigh)));for(let k=c-1;k>=0;k--)e.lineTo(p(k),T(h[k].c.recordLow));e.closePath(),e.fillStyle="rgba(255,255,255,.045)",e.fill(),e.restore(),e.save(),e.beginPath(),h.forEach((k,L)=>L?e.lineTo(p(L),T(k.c.normalHigh)):e.moveTo(p(L),T(k.c.normalHigh)));for(let k=c-1;k>=0;k--)e.lineTo(p(k),T(h[k].c.normalLow));e.closePath(),e.fillStyle="rgba(141,154,171,.20)",e.fill(),e.strokeStyle="rgba(141,154,171,.45)",e.setLineDash([3,3]),e.lineWidth=1,e.stroke(),e.restore();let M=Math.min(15,f*.42);h.forEach((k,L)=>{if(k.tmax==null||k.tmin==null)return;let R=(k.tmax-k.c.normalHigh+(k.tmin-(k.c.normalLow??k.c.normalHigh)))/2,A=H(Math.abs(R)/15,0,1),C=R>=0?_e("#8d9aab","#f2b45a",A):_e("#8d9aab","#7fb2f0",A),O=p(L)-M/2,E=T(k.tmax),D=T(k.tmin);e.save(),e.shadowColor=C,e.shadowBlur=5,e.fillStyle=C;let F=Math.min(4,M/2);e.beginPath(),e.moveTo(O,D-F),e.lineTo(O,E+F),e.quadraticCurveTo(O,E,O+F,E),e.lineTo(O+M-F,E),e.quadraticCurveTo(O+M,E,O+M,E+F),e.lineTo(O+M,D-F),e.quadraticCurveTo(O+M,D,O+M-F,D),e.lineTo(O+F,D),e.quadraticCurveTo(O,D,O,D-F),e.closePath(),e.fill(),e.restore(),k.tmax>=k.c.recordHigh&&(e.save(),e.fillStyle=N.crit,e.font=$e,e.textAlign="center",e.textBaseline="bottom",Ae(e,"REC",p(L),T(k.tmax)-4),e.restore())}),e.save(),e.font=$e,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let $=Rt(c,S.w,e.measureText("WED").width,{least:c>12?2:1});if(h.forEach((k,L)=>{L%$||Oe(e,y.weekday(k.t).toUpperCase(),p(L),o-u+5,0,t)}),e.restore(),vt(e,S,3,"forecast vs climate record \xB0F",[{label:"forecast",color:"#f2b45a"},{label:"normal",color:"rgba(141,154,171,.7)",dash:!0},{label:"record range",short:"record",color:"rgba(255,255,255,.2)"}],{short:"climate record \xB0F"}),n&&n.x>S.x&&n.x<S.x+S.w){let k=H(Math.floor((n.x-S.x)/f),0,c-1),L=h[k],R=L.tmax-L.c.normalHigh;et(e,p(k),n.y,[`${y.weekday(L.t)} ${y.monthDay(L.t)}|`,`FORECAST|${x.temp(L.tmin)} \u2013 ${x.temp(L.tmax)}`,`NORMAL|${x.temp(L.c.normalLow)} \u2013 ${x.temp(L.c.normalHigh)}`,`HIGH vs NORMAL|${x.signed(R)}\xB0`,`RECORD HIGH|${x.temp(L.c.recordHigh)} (${L.c.recordHighYear})`,`RECORD LOW|${x.temp(L.c.recordLow)} (${L.c.recordLowYear})`],t,o,R>=0?"#f2b45a":"#7fb2f0",{pin:n.coarse})}}function Jo(e,t,o,n,{rows:s,tf:l,now:y}){if(!s?.length)return;let g=4,w=22,v=14,i=18,u={x:g,y:v,w:t-g-w,h:o-v-i};if(u.w<30)return;let S=s.length,h=Math.max(2,u.w/S-2),d=Math.max(5.6,Math.ceil(Math.max(...s.map(p=>p.kp))+.8)),m=p=>u.y+u.h-H(p,0,d)/d*u.h;Ce(e,u,[3,5,7].filter(p=>p<=d).map(p=>({v:p,y:m(p)})),String),e.save(),e.strokeStyle=V(N.serious,.5),e.setLineDash([4,3]),e.lineWidth=1,e.beginPath(),e.moveTo(u.x,m(5)),e.lineTo(u.x+u.w,m(5)),e.stroke(),e.setLineDash([]),e.font=ye,e.fillStyle=V(N.serious,.8),e.textAlign="left",e.textBaseline="bottom",Ae(e,"STORM",u.x+3,m(5)-2),e.restore(),s.forEach((p,T)=>{let M=p.kp<3?j[0]:p.kp<5?N.good:p.kp<6?N.warn:p.kp<7?N.serious:N.crit,$=u.x+T*u.w/S;Ve(e,$,m(Math.min(p.kp,d)),h,u.y+u.h,V(M,p.observed==="observed"?.9:.55))}),e.save(),e.font=$e,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let a="",c=e.measureText("WED").width+8,f=-1e9;if(s.forEach((p,T)=>{let M=l.isoDate(p.t);if(M===a)return;a=M;let $=u.x+T*u.w/S+h/2;$<u.x+10||$>u.x+u.w-10||$-f<c||(e.fillText(l.weekday(p.t).toUpperCase(),$,o-i+4),f=$)}),e.restore(),Me(e,u.x+2,2,"planetary K index"),n&&n.x>u.x&&n.x<u.x+u.w){let p=H(Math.floor((n.x-u.x)/u.w*S),0,S-1),T=s[p];et(e,u.x+p*u.w/S+h/2,n.y,[`${l.weekday(T.t)} ${l.hm(T.t)}|`,`Kp|${T.kp.toFixed(2)}`,`STATUS|${(T.observed||"predicted").toUpperCase()}`],t,o,j[3],{pin:n.coarse})}}var Ft=(e,t,o)=>o>=6&&o<22;function ie(e,t,o,n,s){return e==null?.5:e>=o&&e<=n?1:e<o?t>=o?1:H((e-t)/(o-t),0,1):s<=n?1:H((s-e)/(s-n),0,1)}var zt={walk:{label:"WALK",icon:"\u{1F6B6}",color:"#3fd0d8",hours:Ft,score(e){return[["temperature",ie(e.feels??e.temp,30,50,75,95),.3],["dry",1-H((e.pop??0)/100,0,1)*.9,.24],["wind",ie(e.wind,-1,0,12,30),.12],["humidity",ie(e.dew,-20,20,60,76),.1],["UV",ie(e.uv,-1,0,5,11),.07],["air quality",ie(e.air?.aqi,-1,0,50,160),.07],["daylight",e.isDay?1:.5,.1]]}},bike:{label:"BIKE",icon:"\u{1F6B2}",color:"#8fdc6a",hours:Ft,score(e){return[["temperature",ie(e.feels??e.temp,25,58,78,98),.26],["dry",1-H((e.pop??0)/100,0,1),.22],["wind",ie(e.gust??e.wind,-1,0,8,24),.24],["visibility",ie(e.vis,0,8e3,1/0,1/0),.08],["UV",ie(e.uv,-1,0,5,11),.05],["air quality",ie(e.air?.aqi,-1,0,50,150),.05],["daylight",e.isDay?1:.35,.1]]}},grill:{label:"GRILL",icon:"\u{1F525}",color:"#f2b45a",hours:Ft,score(e){return[["dry",1-H((e.pop??0)/100,0,1)*1,.34],["temperature",ie(e.temp,35,62,88,104),.24],["wind",ie(e.wind,-1,0,10,22),.24],["daylight or dusk",e.isDay?1:.55,.1],["humidity",ie(e.dew,-20,20,64,78),.08]]}},stargaze:{label:"STARGAZE",icon:"\u2726",color:"#b39dfa",hours:e=>!e.isDay,score(e,t){return[["darkness",e.isDay?0:1,.26],["clear sky",1-H((e.cloud??0)/100,0,1),.32],["no moon",1-H(t?.moonFraction??.5,0,1)*(t?.moonUp?1:.15),.18],["transparency",ie(e.vis,0,2e4,1/0,1/0),.1],["low humidity",ie(e.rh,-1,0,65,100),.08],["calm",ie(e.wind,-1,0,8,28),.06]]}},photo:{label:"PHOTO",icon:"\u25CE",color:"#f07aa6",hours:(e,t)=>!!e.isDay||t?.sunAltDeg!=null&&t.sunAltDeg>-8,score(e,t){let o=t?.sunAltDeg==null?.4:Math.exp(-Math.pow((t.sunAltDeg-3)/7,2)),n=1-Math.abs((e.cloud??50)/100-.45)*1.6;return[["golden light",H(o,0,1),.4],["sky texture",H(n,0,1),.26],["dry",1-H((e.pop??0)/100,0,1)*.7,.18],["clarity",ie(e.vis,0,15e3,1/0,1/0),.16]]}},swim:{label:"SWIM",icon:"\u{1F3CA}",color:"#7fb2f0",hours:(e,t,o)=>!!e.isDay&&o>=7&&o<20,score(e){let t=[95,96,99].includes(Number(e.code));return[["temperature",ie(e.feels??e.temp,65,80,95,105),.34],["dry",1-H((e.pop??0)/100,0,1),.18],["no thunder",t?0:1,.1],["sunshine",ie(e.cloud,-1,0,40,100),.12],["wind",ie(e.wind,-1,0,10,25),.12],["UV",ie(e.uv,-1,2,7,11),.08],["air quality",ie(e.air?.aqi,-1,0,50,150),.06]]}},openWindows:{label:"OPEN UP",icon:"\u{1FA9F}",color:"#5cd6bc",hours:Ft,score(e){return[["comfortable air",ie(e.temp,40,62,76,90),.34],["dry air",ie(e.dew,-20,25,58,70),.24],["clean air",ie(e.air?.aqi,-1,0,50,130),.22],["no rain",1-H((e.pop??0)/100,0,1),.12],["calm",ie(e.wind,-1,0,14,34),.08]]}}},_t=Object.keys(zt),Bt=e=>zt[e];function Wt(e,t,o){let n=zt[e];if(!n||!t)return null;let s=n.score(t,o),l=0;for(let[,w,v]of s)l+=H(w,0,1)*v;let y=null,g=0;for(let[w,v,i]of s){let u=(1-H(v,0,1))*i;u>g&&(g=u,y=w)}return{score:Math.round(H(l,0,1)*100),limiter:g>.06?y:null,parts:s.map(([w,v,i])=>({name:w,value:H(v,0,1),weight:i}))}}function ta(e,t){let o=e.fmt?.hourOfDay?e.fmt.hourOfDay(t):NaN;return Number.isFinite(o)?o:new Date(t).getHours()}function Qo(e,t,o=36){let n=zt[e];if(!n)return[];let s=Date.now(),l=s+o*36e5;return t.hours.filter(y=>y.t>=s-18e5&&y.t<=l).map(y=>{let g=na(t,y.t),w=n.hours?!!n.hours(y,g,ta(t,y.t)):!0;return{t:y.t,eligible:w,...Wt(e,{...y,air:oa(t,y.t)},g)}})}function Xo(e,t,{hours:o=36,at:n=90}={}){let l=Qo(e,t,o).filter(y=>y.eligible);return{great:l.filter(y=>y.score>=n).length,eligible:l.length}}function Ut(e,t,{hours:o=36,limit:n=3,minScore:s=55}={}){let l=Qo(e,t,o);if(!l.length)return[];for(let v of l)v.eligible||(v.score=-1/0);let y=12,g=new Array(l.length).fill(!1),w=[];for(let v=0;v<n;v++){let i=-1;for(let a=0;a<l.length;a++)g[a]||l[a].score<s||(i<0||l[a].score>l[i].score)&&(i=a);if(i<0)break;let u=l[i].score,S=Math.max(s,u-y),h=i,d=i;for(;h-1>=0&&!g[h-1]&&l[h-1].score>=S;)h--;for(;d+1<l.length&&!g[d+1]&&l[d+1].score>=S;)d++;for(let a=h;a<=d;a++)g[a]=!0;let m=0;for(let a=h;a<=d;a++)m+=l[a].score;w.push({start:l[h].t,end:l[d].t+36e5,peakAt:l[i].t,peak:u,avg:Math.round(m/(d-h+1)),hours:d-h+1,limiter:l[i].limiter,parts:l[i].parts})}return w.sort((v,i)=>i.peak-v.peak||v.start-i.start)}function oa(e,t){if(!e.air?.length)return null;let o=null,n=1/0;for(let s of e.air){let l=Math.abs(s.t-t);l<n&&(n=l,o=s)}return n<36e5*2?o:null}function na(e,t){let o=e.frame(t);return o?{sunAltDeg:o.sun.altDeg,moonFraction:o.moon.fraction,moonUp:o.moon.altDeg>0}:{}}function yt(e){let t=Date.now(),o=t+6*36e5,n=(e.min15?.length?e.min15:e.hours).filter(w=>w.t>=t-9e5&&w.t<=o);if(n.length<2)return null;let s=.002,l=(n[0].precip??0)>=s,y=null;for(let w of n)if((w.precip??0)>=s!==l){y=w;break}let g=n.reduce((w,v)=>(v.precip??0)>(w.precip??0)?v:w,n[0]);return{raining:l,changeAt:y?.t??null,minutes:y?Math.round((y.t-t)/6e4):null,peak:g.precip??0,peakAt:g.t,resolution:e.min15?.length?15:60,series:n.map(w=>({t:w.t,p:w.precip??0}))}}function en(e,t){return e?e.raining?e.minutes!=null?`Rain now \u2014 easing in about ${e.minutes} min`:"Rain now \u2014 no let-up in the next 6 hours":e.minutes!=null&&e.minutes<=240?`${e.peak>.08?"Heavy rain":e.peak>.02?"Rain":"Light rain"} starting in ${e.minutes} min (${t.hm(e.changeAt)})`:null:null}var Gt=e=>e<0?0:e>1?1:e,ge=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function tn(e,t,o={},n={}){if(!t)return null;let s=ge(t.temperature_2m),l=String(o.temperature_2m||"").includes("F"),y=ge(t.wind_speed_10m),g=/mp\/?h|mph/i.test(String(o.wind_speed_10m||"")),w=ge(t.precipitation),v=/inch/i.test(String(o.precipitation||""));return{name:e,tempRaw:s,tempC:s===null?null:l?(s-32)/1.8:s,windKmh:y===null?null:g?y*1.609344:y,precipMm:w===null?null:v?w*25.4:w,cloudPct:ge(t.cloud_cover),night:t.is_day===0,...n}}function wt(e){let t=ge(e?.tempC);if(t===null)return null;let o=Gt(1-Math.abs(t-21)/18),n=Gt(1-(ge(e?.precipMm)??0)/2),s=Gt(1-(ge(e?.cloudPct)??0)/100*.6),l=Gt(1-Math.max(0,(ge(e?.windKmh)??0)-20)/40);return Math.round(100*(.4*o+.3*n+.2*s+.1*l))}function qt(e){let t=ge(e?.precipMm)??0,o=ge(e?.cloudPct),n=ge(e?.windKmh)??0;return t>=.5?"raining":t>0?"drizzling":n>=20+40/2?"blowing hard":o===null?null:o<=15?"clear":o<=45?"some cloud":o<=80?"cloudy":"overcast"}function aa(e,t){let o=wt(e),n=wt(t);if(n===null)return null;let s=ge(t.tempC)!==null&&ge(e?.tempC)!==null?Math.round(t.tempC-e.tempC):null,l=ge(t.tempRaw)!==null&&ge(e?.tempRaw)!==null?Math.round(t.tempRaw-e.tempRaw):null;return{name:t.name,score:n,deltaScore:o===null?null:n-o,deltaC:s,deltaShown:l===null?s:l,better:o!==null&&n>o,headline:qt(t),tempC:ge(t.tempC),localHour:ge(t.localHour),night:t.night===!0}}function on(e,t){let o=(Array.isArray(t)?t:[]).map(n=>aa(e,n)).filter(Boolean);return o.sort((n,s)=>s.score-n.score||(s.deltaC??0)-(n.deltaC??0)||String(n.name).localeCompare(String(s.name))),o}function co(e){if(!e)return"";let t=[],o=e.deltaShown??e.deltaC;return o!==null&&o!==0?t.push(`${Math.abs(o)}\xB0 ${o>0?"warmer":"colder"}`):o===0&&t.push("same temperature"),e.headline&&t.push(e.headline),e.night&&e.localHour!==null&&t.push(`${e.localHour}:00 there`),t.join(", ")}function nn(e,t){if(!t.length)return"Nowhere to compare against right now.";let o=t.filter(l=>l.better);if(!o.length)return`Nowhere on the list beats ${e} right now.`;let n=o[0],s=o.length-1;return`${n.name} is better than ${e} right now \u2014 ${co(n)}.`+(s>0?` So ${s===1?"is one other":`are ${s} others`}.`:"")}var sa="../countdown/stats.json",an=[{place:"San Francisco, California",lat:37.7749,lon:-122.4194},{place:"Vancouver, Canada",lat:49.2497,lon:-123.1193},{place:"Grants Pass, Oregon",lat:42.4393,lon:-123.3307}],ia=600*1e3;function sn(e){e.className="panel elsewhere",e.innerHTML=`
    <div class="hd">ELSEWHERE<span class="rule"></span><span class="val" id="ew-count">\u2014</span></div>
    <div class="body">
      <div class="ew-list" id="ew-list"><div class="ew-empty">Looking\u2026</div></div>
      <p class="ew-say" id="ew-say"></p>
    </div>`;let t=S=>e.querySelector(`#${S}`),o=null,n=0,s=[],l="",y=!1;async function g(){if(o)return o;try{let S=await(await fetch(new URL(sa,location.href),{cache:"no-cache"})).json(),h=Array.isArray(S?.trips)?S.trips:[],d=new Date,m=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,a=f=>typeof f.date!="string"||(f.date.length===7?`${f.date}-01`:f.date)<=m,c=new Set;o=h.filter(f=>f&&typeof f.lat=="number"&&typeof f.lon=="number"&&a(f)&&typeof f.place=="string"&&!c.has(f.place)&&c.add(f.place)),o.length||(console.warn("ELSEWHERE: trip list had no usable coordinates; using the fallback"),o=an)}catch(S){console.warn("ELSEWHERE: could not read the trip list, using the fallback \u2014",S.message),o=an}return o}async function w(S){try{let d=(await ce.bundle(S.lat,S.lon))?.forecast?.data;if(!d?.current)return null;let m=Number(String(d.current.time||"").slice(11,13));return tn(S.place,d.current,d.current_units,{localHour:Number.isFinite(m)?m:null})}catch{return null}}async function v(){let S=r.loc;if(!S||y)return;let h=`${S.lat?.toFixed(2)},${S.lon?.toFixed(2)}`;if(!(h===l&&Date.now()-n<ia)){y=!0;try{let d=await g(),m=await w({place:S.name||"here",lat:S.lat,lon:S.lon});if(!m)return;let a=(await Promise.all(d.map(w))).filter(Boolean);s=on(m,a),l=h,n=Date.now(),i(m),u(m)}finally{y=!1}}}function i(S){let h=wt(S),d=s.filter(c=>c.better);if(t("ew-count").textContent=s.length?d.length?`${d.length} better`:"none better":"\u2014",!s.length){t("ew-list").innerHTML='<div class="ew-empty">No places to compare.</div>',t("ew-say").textContent="";return}let m=c=>`
      <div class="ew-row${c.better?" is-better":""}">
        <span class="ew-name">${oe(c.name)}</span>
        <span class="ew-what">${oe(co(c))}</span>
      </div>`,a=`
      <div class="ew-here">
        <span class="ew-name">${oe(S.name)}</span>
        <span class="ew-what">here \xB7 ${oe(qt(S)||"")}${Number.isFinite(h)?` \xB7 ${h}/100`:""}</span>
      </div>`;t("ew-list").innerHTML=d.map(m).join("")+a+s.filter(c=>!c.better).map(m).join(""),t("ew-say").textContent=nn(S.name,s)}async function u(S){try{let h={here:S.name,hereSky:qt(S),hereScore:wt(S),rows:s.map(a=>({name:a.name,delta:a.deltaShown??a.deltaC,sky:a.headline,better:a.better,night:a.night}))},d=btoa(unescape(encodeURIComponent(JSON.stringify(h)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),m=await ce.elsewhere(d);m?.text&&l&&(t("ew-say").textContent=m.text)}catch{}}return{update(){v()},onHide(){}}}function rn(e){e.className="view deck active",e.innerHTML=`
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
  `;let t=a=>e.querySelector("#"+a),o=sn(t("d-elsewhere")),n=le(t("d-meteo"),(a,c,f,p)=>{let T=Date.now();Ht(a,c,f,p,{hours:r.hours,days:r.days,tf:r.fmt,span:{lo:r.cursor-12*36e5,hi:r.cursor+36*36e5},cursor:r.cursor,now:T,panels:["temp","pop","wind"]})},{onPick:({x:a,w:c})=>{let f=r.cursor-432e5,p=r.cursor+36*36e5,T=c-34;r.playing=!1,r.scrubTo(f+(a-4)/T*(p-f))}}),s=le(t("d-spark"),(a,c,f)=>{let p=r.hours.filter(M=>M.t>=r.cursor-36e5&&M.t<=r.cursor+864e5);if(p.length<2)return;let T=Wo(a,{x:0,y:4,w:c,h:f-14},p.map(M=>M.temp),{color:j[0],glow:9});a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="center",a.textBaseline="bottom";for(let M=0;M<p.length;M+=6)Oe(a,r.fmt.hour(p[M].t).replace(/\s/g,""),M/(p.length-1)*c,f,0,c);a.restore(),T?.length&&(a.save(),a.fillStyle=ve,a.shadowColor=j[0],a.shadowBlur=5,a.beginPath(),a.arc(T[1]?.[0]??T[0][0],T[1]?.[1]??T[0][1],3,0,Math.PI*2),a.fill(),a.restore())}),l=le(t("d-moondisc"),(a,c,f)=>{let p=r.frame();p&&Nt(a,c/2,f/2,Math.max(10,Math.min(c,f)/2-3),p.moon.phase,p.moon.fraction)}),y=le(t("d-nc"),(a,c,f)=>{let p=yt(r);if(!p?.series?.length)return;let T=Math.max(...p.series.map(k=>k.p),.02),M=p.series.length,$=Math.max(1,c/M-.6);p.series.forEach((k,L)=>{let R=L*c/M,A=k.p>0?Math.max(1.5,k.p/T*f):0;A&&Ve(a,R,f-A,$,f,V(k.p>.08?N.crit:k.p>.02?j[0]:j[4],.9),2)}),a.save(),a.strokeStyle="rgba(255,255,255,.10)",a.beginPath(),a.moveTo(0,f-.5),a.lineTo(c,f-.5),a.stroke(),a.restore()}),g=[["g-wind",(a,c,f)=>{let p=r.frame(),T=Math.min(c,f)/2-16;Uo(a,c/2,f/2-4,Math.max(14,T),{dir:p?.windDir,speed:p?.wind,gust:p?.gust,color:j[3]})}],["g-hum",(a,c,f)=>{let p=r.frame(),T=Math.min(c,f)/2-18;je(a,c/2,f/2-6,Math.max(14,T),{value:p?.rh,min:0,max:100,color:j[4],label:"humidity",unit:"%",sub:p?qe(p.dew).name:""})}],["g-pres",(a,c,f)=>{let p=r.frame(),T=Math.min(c,f)/2-18,M=p?.pressure?p.pressure*.029529983:null;je(a,c/2,f/2-6,Math.max(14,T),{value:M,min:28.5,max:31,color:j[3],label:"pressure",unit:"inHg",decimals:2,sub:w()})}],["g-uv",(a,c,f)=>{let p=r.frame(),T=Math.min(c,f)/2-18;je(a,c/2,f/2-6,Math.max(14,T),{value:p?.uv,min:0,max:12,color:Ge(p?.uv).color,label:"uv index",unit:"index",decimals:1,sub:Ge(p?.uv).name,bands:[{from:0,to:3,color:N.good},{from:3,to:6,color:N.warn},{from:6,to:8,color:N.serious},{from:8,to:11,color:N.crit},{from:11,to:12,color:j[3]}]})}],["g-aqi",(a,c,f)=>{let T=r.frame()?.air?.aqi??r.airNow?.aqi,M=ze(T),$=Math.min(c,f)/2-18;je(a,c/2,f/2-6,Math.max(14,$),{value:T,min:0,max:200,color:M.color,label:"air quality",unit:"US AQI",sub:M.name.length>12?"SENSITIVE":M.name,bands:[{from:0,to:50,color:N.good},{from:50,to:100,color:N.warn},{from:100,to:150,color:N.serious},{from:150,to:200,color:N.crit}]})}],["g-vis",(a,c,f)=>{let p=r.frame(),T=p?.vis!=null?p.vis/1609.344:null,M=Math.min(c,f)/2-18;je(a,c/2,f/2-6,Math.max(14,M),{value:T==null?null:Math.min(T,10),min:0,max:10,color:j[0],label:"visibility",unit:"miles",decimals:1,sub:T==null?"":T>=9?"CLEAR":T>=3?"HAZY":T>=1?"POOR":"FOG"})}]].map(([a,c])=>le(t(a),c));function w(){let a=r.cursor,c=r.hours.find(T=>T.t>=a-3*36e5),f=r.hours.find(T=>T.t>=a);if(!c?.pressure||!f?.pressure)return"";let p=(f.pressure-c.pressure)*.029529983;return Math.abs(p)<.02?"STEADY":p>0?`RISING ${p.toFixed(2)}`:`FALLING ${Math.abs(p).toFixed(2)}`}function v(){let a=r.frame();if(!a)return;let c=r.fmt;t("d-temp").innerHTML=`${a.temp==null?"--":Math.round(a.temp)}<sup>\xB0F</sup>`,t("d-cond").textContent=a.wx.label,t("d-glyph").textContent=eo(Math.round(a.code??0),a.isDay>.5),t("d-feels").textContent=x.temp(a.feels),t("d-dew").textContent=x.temp(a.dew),t("d-obs").textContent=r.atNow?`LIVE \xB7 ${Xt(r.lastFetch)}`:`PROJECTED \xB7 ${c.hm(r.cursor)}`;let f=r.observed,p=t("d-obsline");if(r.atNow&&f?.tempF!=null){let P=a.temp!=null?a.temp-f.tempF:null;p.innerHTML=`observed <b>${Math.round(f.tempF)}\xB0</b><span> \xB7 ${oe(f.name||f.station)} ${f.distanceMi} mi \xB7 ${Xt(Date.parse(f.time))}</span>`+(P!=null&&Math.abs(P)>=1.5?`<em> \xB7 model runs ${x.signed(P,0)}\xB0</em>`:""),p.style.display=""}else p.style.display="none";let T=a.day;t("d-hi").textContent=x.temp(T?.tmax),t("d-lo").textContent=x.temp(T?.tmin);let M=t("d-anom"),$=r.climate?.doy?.[m(r.cursor)];if($&&T?.tmax!=null){let P=T.tmax-$.normalHigh;M.textContent=`${x.signed(P,1)}\xB0`,M.style.color=Math.abs(P)<2?pe:P>0?"#f2b45a":"#7fb2f0"}else M.textContent="--",M.style.color="";let k=r.sunTimesFor();t("d-sunrise").textContent=c.hm(k.sunrise),t("d-sunset").textContent=c.hm(k.sunset),t("d-daylight").textContent=T?.daylight?st(T.daylight):"--";let L=r.alerts,R=t("d-alertPanel");R.style.display=L.length?"":"none",t("d-alertN").textContent=String(L.length),t("d-alerts").innerHTML=L.slice(0,4).map(P=>`
      <div class="alert-item" style="--ac:${gt(P.event,P.severity)}">
        <b>${oe(P.event||"Alert")}</b>
        <span>until ${c.weekday(P.expires||P.ends)} ${c.hm(P.expires||P.ends)}</span>
      </div>`).join("");let A=yt(r),C=en(A,c),O=t("d-ncline");if(C)O.textContent=C,O.className="nowcast-line wet";else{let P=r.hours.find(G=>G.t>Date.now()&&(G.pop??0)>=40);O.textContent=P?`Dry for 6+ hours. Next real chance ${c.weekday(P.t)} ${c.hm(P.t)} (${Math.round(P.pop)}%).`:"Dry. No meaningful precipitation in the forecast window.",O.className="nowcast-line"}t("d-ncres").textContent=A?`${A.resolution}-MIN`:"\u2014";let E=a.moon,D=r.moonTimesFor();t("d-moonname").textContent=`${Math.round(E.fraction*100)}% LIT`,t("d-sunmoon").innerHTML=`
      <dl style="margin:0">
        ${h("Sun altitude",`${a.sun.altDeg.toFixed(1)}\xB0 ${me(a.sun.compass)}`)}
        ${h("Golden hour",`${c.hm(k.goldenHour)} \u2013 ${c.hm(k.sunset)}`)}
        ${h("Blue hour",`${c.hm(k.sunset)} \u2013 ${c.hm(k.dusk)}`)}
        ${h("Astro dark",isNaN(+k.night)?"none tonight":c.hm(k.night))}
        ${h("Moon",`${d(E.phase)}`)}
        ${h("Moon alt",`${E.altDeg.toFixed(1)}\xB0 ${me(E.compass)}`)}
        ${h("Moonrise",D.rise?c.hm(D.rise):"\u2014")}
        ${h("Moonset",D.set?c.hm(D.set):"\u2014")}
      </dl>`;let F=Lt(a.wind);t("n-wind").textContent=`${F.name} \xB7 from ${me(a.windDir)}`,t("n-hum").textContent=qe(a.dew).note,t("n-pres").textContent=a.pressure?`${Math.round(a.pressure)} hPa`:"";let W=Et(a.uv,r.settings.skinType);t("n-uv").textContent=W==null?"no burn risk":W>180?"burn risk negligible":`burn in ~${W} min`;let U=a.air?.aqi??r.airNow?.aqi;t("n-aqi").textContent=a.air?.pm25!=null?`PM2.5 ${a.air.pm25.toFixed(1)} \xB5g/m\xB3`:U!=null?"":"no data",t("n-vis").textContent=a.vis!=null?`${(a.vis/1609.344).toFixed(1)} mi`:"",t("d-instnote").textContent=r.atNow?"LIVE":c.hm(r.cursor),u(),S(),l.render();for(let P of g)P.render();n.render(),s.render(),y.render()}let i=null;function u(){let a=r.fmt,c=T=>`${a.weekday(T)} ${a.hour(T)}`,f=(T,M)=>a.isoDate(T)===a.isoDate(M)?`${a.weekday(T)} ${a.hour(T)}\u2013${a.hour(M)}`:`${c(T)} \u2013 ${c(M)}`,p=_t.map(T=>{let M=Bt(T),$=Ut(T,r,{hours:36,limit:1,minScore:50})[0],k=Xo(T,r,{hours:36,at:90});return{k:T,meta:M,w:$,g:k}}).sort((T,M)=>M.g.great-T.g.great||(M.w?.peak??0)-(T.w?.peak??0));t("d-act").innerHTML=p.map(({k:T,meta:M,w:$,g:k})=>{let L=k.great,R=k.eligible?L/k.eligible:0,A=L>0?N.good:($?.peak??0)>=60?N.warn:N.serious,C=$?`<b class="act-best">Best ${c($.peakAt)}</b><span class="act-good">Good ${f($.start,$.end)}</span>`+(L===0?`<span class="act-note">Best hour scores ${$.peak}/100</span>`:"")+($.limiter?`<span class="act-note">Held back by ${$.limiter}</span>`:""):'<span class="act-note">No good time in the next 36 hours</span>',O=i===T&&$,E=$?$.parts.map(D=>{let F=Math.round((1-D.value)*D.weight*100);return`<span class="act-factor"><span class="act-fname">${D.name}</span><span class="meter act-fbar" style="--ac:${F===0?N.good:D.value>=.6?N.warn:N.serious}"><i style="width:${Math.round(D.value*100)}%"></i></span><span class="act-fpts">${F?"\u2212"+F:"full marks"}</span></span>`}).join(""):"";return`
        <button type="button" class="act-row" data-act="${T}" aria-expanded="${O?"true":"false"}"
                aria-controls="act-why-${T}"${$?"":" disabled"}>
          <span class="act-icon" style="color:${M.color}">${M.icon}</span>
          <span class="act-text">
            <span class="act-name">${M.label}</span>
            <span class="act-when">${C}</span>
            <span class="meter act-bar" style="--ac:${A}"><i style="width:${Math.round(R*100)}%"></i></span>
          </span>
          <span class="act-score" style="color:${A}">${L}<small class="act-unit">great hours</small></span>
        </button>
        <div class="act-why" id="act-why-${T}"${O?"":" hidden"}>
          <span class="act-whyhd">Why the best hour (${$?c($.peakAt):""}) scores ${$?.peak??0}</span>${E}
        </div>`}).join("")}t("d-act").addEventListener("click",a=>{let c=a.target.closest(".act-row");!c||c.disabled||(i=i===c.dataset.act?null:c.dataset.act,u(),t("d-act").querySelector(`.act-row[data-act="${c.dataset.act}"]`)?.focus())}),t("d-act").addEventListener("keydown",a=>{if(a.key!=="Escape"||!i)return;let c=i;i=null,u(),t("d-act").querySelector(`.act-row[data-act="${c}"]`)?.focus()});function S(){let a=r.fmt,c=a.isoDate(Date.now()),f=r.days.filter(k=>k.tmax!=null&&a.isoDate(k.t)>=c);if(!f.length)return;let p=Math.min(...f.map(k=>k.tmin)),T=Math.max(...f.map(k=>k.tmax)),M=a.isoDate(Date.now()),$=a.isoDate(r.cursor);t("d-tenday").innerHTML=f.map(k=>{let L=a.isoDate(k.t),R=(T-k.tmax)/(T-p||1)*100,A=(k.tmin-p)/(T-p||1)*100,C=`linear-gradient(to top, ${Ee(k.tmin)}, ${Ee(k.tmax)})`;return`
        <div class="tenday-col ${L===M?"today":""} ${L===$?"cursor":""}" data-t="${k.t}">
          <div class="td-day">${L===M?"TODAY":a.weekday(k.t)}</div>
          <div class="td-date">${a.monthDay(k.t)}</div>
          <div class="td-glyph" title="${Qe(Math.round(k.code)).long}">${eo(Math.round(k.code),!0)}</div>
          <div class="td-hi">${Math.round(k.tmax)}\xB0</div>
          <div class="td-bar"><i style="top:${R}%;bottom:${A}%;background:${C};box-shadow:0 0 8px ${Ee(k.tmax)}66"></i></div>
          <div class="td-lo">${Math.round(k.tmin)}\xB0</div>
          <div class="td-pop">${(k.pop??0)>=10?`${Math.round(k.pop)}%`:""}</div>
        </div>`}).join(""),t("d-tdnote").textContent=`${f.length} DAYS AHEAD`,t("d-tenday").querySelectorAll(".tenday-col").forEach(k=>{k.addEventListener("click",()=>{r.playing=!1,r.scrubTo(+k.dataset.t+13*36e5)})})}let h=(a,c)=>`<div class="kv"><dt>${a}</dt><dd>${c}</dd></div>`,d=a=>["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous","Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"][Math.round((a%1+1)%1*8)%8],m=a=>{let c=r.fmt.isoDate(a),[,f,p]=c.split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][f-1]+p-1};return{update(){v(),o.update()},onHide(){o.onHide()}}}var ut="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas",jt="grayscale(1) brightness(1.18) contrast(1.05) sepia(.6) hue-rotate(170deg) saturate(1.3)",Kt="grayscale(1) brightness(1.9) contrast(1.1) sepia(.4) hue-rotate(170deg) saturate(.8)";var we={lonToWorld:(e,t)=>(e+180)/360*Math.pow(2,t)*256,latToWorld:(e,t)=>{let o=Math.sin(Math.max(-85.05,Math.min(85.05,e))*Math.PI/180);return(.5-Math.log((1+o)/(1-o))/(4*Math.PI))*Math.pow(2,t)*256},worldToLon:(e,t)=>e/(Math.pow(2,t)*256)*360-180,worldToLat:(e,t)=>{let o=Math.PI-2*Math.PI*e/(Math.pow(2,t)*256);return 180/Math.PI*Math.atan(.5*(Math.exp(o)-Math.exp(-o)))}},ot=new Map,Vt=0,ra=[1500,4e3];function dn(e,t,o){let n=new Image;t.img=n,t.state="loading",Vt++,n.crossOrigin="anonymous",n.onload=()=>{t.state="ok",Vt--,o?.()},n.onerror=()=>{Vt--;let s=ra[t.tries++];if(s===void 0){t.state="err";return}setTimeout(()=>{ot.get(e)===t&&dn(e,t,o)},s)},n.src=e}function ln(e,t){let o=ot.get(e);if(o)return o.state==="ok"?o.img:null;if(Vt>24)return null;let n={img:null,state:"loading",tries:0};if(ot.set(e,n),dn(e,n,t),ot.size>600){let s=Math.floor(150);for(let l of ot.keys()){if(s--<=0)break;ot.delete(l)}}return null}var la=10,ct=class{constructor(t,{center:o=[0,0],zoom:n=7,minZoom:s=2,maxZoom:l=12,onMove:y,onTap:g}={}){this.canvas=t,this.ctx=t.getContext("2d"),this.lat=o[0],this.lon=o[1],this.zoom=n,this.minZoom=s,this.maxZoom=l,this.onMove=y,this.onTap=g,this.layers=[],this.overlays=[],this.dirty=!0,this.w=0,this.h=0,this._raf=null,this._bind(),this._ro=new ResizeObserver(()=>this.resize()),this._ro.observe(t),this.resize()}resize(){let t=Math.min(window.devicePixelRatio||1,2),o=this.canvas.clientWidth,n=this.canvas.clientHeight;!o||!n||(this.canvas.width=Math.round(o*t),this.canvas.height=Math.round(n*t),this.ctx.setTransform(t,0,0,t,0,0),this.w=o,this.h=n,this.invalidate())}invalidate(){this._raf||(this._raf=requestAnimationFrame(()=>{this._raf=null,this.render()}))}setView(t,o,n){this.lat=t,this.lon=o,n!=null&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n))),this.invalidate(),this.onMove?.(this)}project(t,o){let n=this.zoom;return[we.lonToWorld(o,n)-we.lonToWorld(this.lon,n)+this.w/2,we.latToWorld(t,n)-we.latToWorld(this.lat,n)+this.h/2]}unproject(t,o){let n=this.zoom;return[we.worldToLat(we.latToWorld(this.lat,n)+o-this.h/2,n),we.worldToLon(we.lonToWorld(this.lon,n)+t-this.w/2,n)]}_placeAt(t,o,n,s){let l=this.zoom;this.lon=we.worldToLon(we.lonToWorld(o,l)+this.w/2-n,l),this.lat=Math.max(-85,Math.min(85,we.worldToLat(we.latToWorld(t,l)+this.h/2-s,l)))}_zoomAbout(t,o,n){let[s,l]=this.unproject(t,o);this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n)),this._placeAt(s,l,t,o)}_bind(){let t=this.canvas,o=new Map,n=null,s=null,l=v=>({x:v.clientX-s.left,y:v.clientY-s.top}),y=()=>{let v=[...o.values()];return{n:v.length,x:v.reduce((i,u)=>i+u.x,0)/v.length,y:v.reduce((i,u)=>i+u.y,0)/v.length,span:v.length<2?0:Math.hypot(v[0].x-v[1].x,v[0].y-v[1].y)}},g=()=>{if(!o.size){n=null;return}let v=y(),[i,u]=this.unproject(v.x,v.y);n={lat:i,lon:u,span:v.span,zoom:this.zoom}};t.addEventListener("pointerdown",v=>{if(o.size>=2)return;s=t.getBoundingClientRect();let i=l(v);o.set(v.pointerId,{...i,x0:i.x,y0:i.y});try{t.setPointerCapture(v.pointerId)}catch{}g(),t.style.cursor="grabbing"}),t.addEventListener("pointermove",v=>{if(!n||!o.has(v.pointerId))return;let i=o.get(v.pointerId);o.set(v.pointerId,{...l(v),x0:i.x0,y0:i.y0});let u=y();u.n>1&&n.span>20&&u.span>8&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n.zoom+Math.log2(u.span/n.span)))),this._placeAt(n.lat,n.lon,u.x,u.y),this.invalidate(),this.onMove?.(this)});let w=v=>{let i=o.get(v.pointerId);if(o.delete(v.pointerId)){try{t.releasePointerCapture(v.pointerId)}catch{}this.onTap&&!o.size&&Math.hypot(i.x-i.x0,i.y-i.y0)<la&&this.onTap({x:i.x,y:i.y},v),g(),o.size||(t.style.cursor="grab")}};t.addEventListener("pointerup",w),t.addEventListener("pointercancel",w),t.addEventListener("wheel",v=>{v.preventDefault();let i=t.getBoundingClientRect(),u=-v.deltaY*(v.deltaMode===1?.05:.0022);this._zoomAbout(v.clientX-i.left,v.clientY-i.top,this.zoom+u),this.invalidate(),this.onMove?.(this)},{passive:!1});for(let v of["gesturestart","gesturechange","gestureend"])t.addEventListener(v,i=>i.preventDefault());t.style.cursor="grab",t.style.touchAction="none"}_layerTiles(t,o,n,s){let{w:l,h:y}=this,g=Math.min(o,t.maxTileZoom??o),w=256*Math.pow(2,this.zoom-g),v=Math.pow(2,g),i=Math.floor(n/w),u=Math.floor((n+l)/w),S=Math.floor(s/w),h=Math.floor((s+y)/w),d=[];for(let m=S;m<=h;m++)if(!(m<0||m>=v))for(let a=i;a<=u;a++){let c=(a%v+v)%v,f=t.url(g,c,m);f&&d.push({tx:a,ty:m,url:f})}return{size:w,tiles:d}}tilesSettled(t,o){let n=this.layers.find(v=>v.name===t);if(!n||n.enabled===!1||n.opacity===0||!this.w||!this.h)return!0;let s=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),l=we.lonToWorld(this.lon,this.zoom)-this.w/2,y=we.latToWorld(this.lat,this.zoom)-this.h/2,{tiles:g}=this._layerTiles(o?{...n,url:o}:n,s,l,y),w=!0;for(let v of g){o&&ln(v.url,()=>this.invalidate());let i=ot.get(v.url)?.state;i!=="ok"&&i!=="err"&&(w=!1)}return w}render(){let{ctx:t,w:o,h:n}=this;if(!o||!n)return;t.clearRect(0,0,o,n),t.fillStyle="#0f1826",t.fillRect(0,0,o,n);let s=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),l=we.lonToWorld(this.lon,this.zoom)-o/2,y=we.latToWorld(this.lat,this.zoom)-n/2,g=()=>this.invalidate();for(let w of this.layers){if(w.enabled===!1||w.opacity===0)continue;let{size:v,tiles:i}=this._layerTiles(w,s,l,y);t.save(),t.globalAlpha=w.opacity??1,w.filter&&(t.filter=w.filter),w.blend&&(t.globalCompositeOperation=w.blend);let u=.5;for(let{tx:S,ty:h,url:d}of i){let m=ln(d,g);m&&t.drawImage(m,Math.round(S*v-l)-u,Math.round(h*v-y)-u,Math.ceil(v)+u*2,Math.ceil(v)+u*2)}t.restore()}for(let w of this.overlays){t.save();try{w(t,this)}catch(v){console.error("[map overlay]",v)}t.restore()}}destroy(){this._ro.disconnect()}};function cn(e,t,o,{stroke:n,fill:s,width:l=1.5,glow:y=8}){if(!o)return;let g=o.type==="Polygon"?[o.coordinates]:o.type==="MultiPolygon"?o.coordinates:null;if(g){e.beginPath();for(let w of g)for(let v of w)v.forEach(([i,u],S)=>{let[h,d]=t.project(u,i);S===0?e.moveTo(h,d):e.lineTo(h,d)}),e.closePath();s&&(e.fillStyle=s,e.fill("evenodd")),n&&(e.save(),y&&(e.shadowColor=n,e.shadowBlur=y/2),e.strokeStyle=n,e.lineWidth=l,e.stroke(),e.restore())}}function Yt(e,t,o,n="#f07aa6",s=null,l=0){e.save(),e.shadowColor=n,e.shadowBlur=7,e.strokeStyle=n,e.lineWidth=1.5;let y=7;e.beginPath(),e.arc(t,o,y,0,Math.PI*2),e.stroke(),e.beginPath();for(let[g,w]of[[-1,0],[1,0],[0,-1],[0,1]])e.moveTo(t+g*(y+2),o+w*(y+2)),e.lineTo(t+g*(y+7),o+w*(y+7));if(e.stroke(),e.fillStyle=n,e.beginPath(),e.arc(t,o,2.2,0,Math.PI*2),e.fill(),l>0&&(e.globalAlpha=1-l,e.beginPath(),e.arc(t,o,y+l*26,0,Math.PI*2),e.stroke(),e.globalAlpha=1),s){e.shadowBlur=0,e.font="600 11.5px 'Chakra Petch', sans-serif",e.letterSpacing="1.4px",e.textAlign="left",e.textBaseline="middle";let g=e.measureText(s).width+10;e.fillStyle="rgba(22,33,47,.85)",e.fillRect(t+y+8,o-7,g,14),e.fillStyle=n,e.fillText(s,t+y+13,o)}e.restore()}function xt(e,t,o,n){let s=156543.03392*Math.cos(t.lat*Math.PI/180)/Math.pow(2,t.zoom),y=s*110/1609.344,w=[1,2,5,10,20,50,100,200,500,1e3].reduce((i,u)=>Math.abs(u-y)<Math.abs(i-y)?u:i),v=w*1609.344/s;e.save(),e.strokeStyle="rgba(221,226,232,.75)",e.lineWidth=1,e.beginPath(),e.moveTo(o,n-4),e.lineTo(o,n),e.lineTo(o+v,n),e.lineTo(o+v,n-4),e.stroke(),e.font="500 11.5px 'JetBrains Mono', monospace",e.fillStyle="rgba(221,226,232,.75)",e.textAlign="center",e.textBaseline="bottom",e.fillText(`${w} mi`,o+v/2,n-5),e.restore()}var da=5;function un(e){e.className="view radar",e.innerHTML=`
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
  `;let t=A=>e.querySelector("#"+A),o=[],n=0,s=0,l=!1,y=0,g="",w=null,v=performance.now(),i="",u=new ct(t("r-map"),{center:[r.loc?.lat??0,r.loc?.lon??0],zoom:7,minZoom:3,maxZoom:11,onMove:()=>p()}),S=A=>(C,O,E)=>!A||!i?null:`${i}${A.path}/256/${C}/${O}/${E}/4/1_1.png`;u.layers=[{name:"base",url:(A,C,O)=>`${ut}/World_Dark_Gray_Base/MapServer/tile/${A}/${O}/${C}`,filter:jt,opacity:1},{name:"radar",url:(A,C,O)=>S(o[n])(A,C,O),opacity:.82,blend:"screen",maxTileZoom:7},{name:"labels",url:(A,C,O)=>`${ut}/World_Dark_Gray_Reference/MapServer/tile/${A}/${O}/${C}`,filter:Kt,opacity:1}];let h=A=>u.layers.find(C=>C.name===A);u.overlays.push((A,C)=>{if(h("alerts")?.enabled!==!1&&d)for(let O of r.alerts){if(!O.geometry)continue;let E=gt(O.event,O.severity);cn(A,C,O.geometry,{stroke:E,fill:V(E,.12),width:1.5,glow:10})}if(r.loc){let[O,E]=C.project(r.loc.lat,r.loc.lon);Yt(A,O,E,j[1],r.loc.name.toUpperCase())}xt(A,C,14,C.h-14),A.save(),A.strokeStyle="rgba(63,208,216,.06)",A.lineWidth=1;for(let O=1;O<4;O++)A.beginPath(),A.moveTo(C.w*O/4,0),A.lineTo(C.w*O/4,C.h),A.moveTo(0,C.h*O/4),A.lineTo(C.w,C.h*O/4),A.stroke();A.restore()});let d=!0,m=le(t("r-strip"),(A,C,O)=>{if(!o.length)return;let E=o.length,D=Math.max(2,C/E-2),F=o.findIndex(W=>W.kind==="nowcast");if(o.forEach((W,U)=>{let P=U*C/E,G=W.kind==="past",te=U===n?j[1]:G?j[0]:N.warn;A.fillStyle=V(te,U===n?1:.3),A.fillRect(P,U===n?2:6,D,U===n?O-4:O-12)}),F>0){let W=F*C/E-1;A.save(),A.strokeStyle=V(N.warn,.8),A.setLineDash([2,2]),A.beginPath(),A.moveTo(W,0),A.lineTo(W,O),A.stroke(),A.restore()}},{onPick:({x:A,w:C})=>{if(!o.length)return;let O=o[H(Math.floor(A/C*o.length),0,o.length-1)];r.playing=!1,r.emit("play",!1),r.scrubTo(O.time*1e3)}});function a(A){let C=0,O=1/0;for(let E=0;E<o.length;E++){let D=Math.abs(o[E].time*1e3-A);D<O&&(O=D,C=E)}return C}function c(){if(!o.length)return;let A=a(r.cursor);A!==n&&(n=A,T())}function f(){t("r-play").textContent=r.playing?"\u275A\u275A":"\u25B6"}let p=()=>m.render();function T(){let A=o[n];if(!A)return;t("r-time").textContent=r.fmt.hm(A.time*1e3);let C=Math.round((Date.now()/1e3-A.time)/60);t("r-age").textContent=A.kind==="nowcast"?`FORECAST +${Math.abs(C)}m`:C<=1?"LATEST":`${C} MIN AGO`,t("r-age").style.color=A.kind==="nowcast"?N.warn:C<=12?N.good:pe,u.invalidate(),m.render()}async function M(){try{let A=r.radar||await ce.radar();i=A.host;let C=(A.radar?.past||[]).map(E=>({...E,kind:"past"})),O=(A.radar?.nowcast||[]).map(E=>({...E,kind:"nowcast"}));o=[...C,...O],n=a(r.cursor),t("r-src").textContent=O.length?`${C.length} OBS + ${O.length} FCST`:`${C.length} OBSERVED`,T(),$()}catch(A){console.error("[radar] frames",A),t("r-src").textContent="UNAVAILABLE"}}function $(){let A=[["#62a4ef","light"],["#6cc98f","moderate"],["#ecd46a","heavy"],["#f59a5b","very heavy"],["#f47171","intense"],["#c89af5","hail"]];t("r-legend").innerHTML='<span class="lg-title">intensity</span>'+A.map(([C,O])=>`<b><i style="background:${C}"></i>${O}</b>`).join("")}function k(){let A=r.fmt,C=r.frame(),O=[C?.t,C?.precip,C?.cape,C?.cloud,r.alerts.length,r.hours.length].join("|");if(O===g&&r.raw===w)return;g=O,w=r.raw;let E=r.alerts;t("r-alertn").textContent=String(E.length),t("r-alertlist").innerHTML=E.length?E.map(Q=>`
      <div class="alert-item" style="--ac:${gt(Q.event,Q.severity)}">
        <b>${oe(Q.event)}</b>
        <span>${oe(Q.areaDesc||"").slice(0,90)}</span><br>
        <span>until ${A.weekday(Q.expires)} ${A.hm(Q.expires)}</span>
      </div>`).join(""):'<div class="nodata">no active alerts</div>';let D=r.frame(),F=r.hours.filter(Q=>Q.t>=Date.now()&&Q.t<=Date.now()+6*36e5),W=F.reduce((Q,J)=>Q+(J.precip??0),0),U=Math.max(0,...F.map(Q=>Q.pop??0));t("r-cover").innerHTML=`
      <dl style="margin:0">
        ${R("Now",D?.wx.label??"--")}
        ${R("Rate",D?.precip!=null?`${D.precip.toFixed(3)} in/hr`:"--")}
        ${R("Next 6h total",`${W.toFixed(2)} in`)}
        ${R("Peak chance 6h",`${Math.round(U)}%`)}
        ${R("Cloud cover",D?.cloud!=null?`${Math.round(D.cloud)}%`:"--")}
        ${R("Freezing level",D?.freezing!=null?`${Math.round(D.freezing*3.28084)} ft`:"--")}
      </dl>`;let P=D?.cape??0,G=D?.li,te=D?.cin,B=P<300?["STABLE",N.good]:P<1e3?["MARGINAL",j[0]]:P<2500?["MODERATE",N.warn]:P<4e3?["STRONG",N.serious]:["EXTREME",N.crit],Z=Math.max(0,...r.hours.filter(Q=>Q.t>=Date.now()&&Q.t<=Date.now()+24*36e5).map(Q=>Q.cape??0));t("r-conv").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px">
        <span class="num" style="font-size:1.5rem;font-weight:700;color:${B[1]}">${Math.round(P)}</span>
        <span class="lbl">J/kg CAPE</span>
        <span class="chip" style="--ac:${B[1]};margin-left:auto">${B[0]}</span>
      </div>
      <div class="meter seg" style="--ac:${B[1]};margin-bottom:8px"><i style="width:${H(P/4e3*100,0,100)}%"></i></div>
      <dl style="margin:0">
        ${R("Lifted index",G!=null?G.toFixed(1):"--")}
        ${R("Inhibition",te!=null?`${Math.round(te)} J/kg`:"--")}
        ${R("Peak CAPE 24h",`${Math.round(Z)} J/kg`)}
      </dl>
      <div style="font-size:max(.58rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        CAPE is the energy available to a rising parcel. Above ~1000 J/kg with a
        negative lifted index, thunderstorms become plausible.
      </div>`}t("r-play").addEventListener("click",()=>{r.playing=!r.playing,r.emit("play",r.playing),f()}),r.on("play",f),r.on("cursor",()=>{r.view==="radar"&&(c(),f())}),t("r-center").addEventListener("click",()=>{r.loc&&u.setView(r.loc.lat,r.loc.lon,7)}),t("r-zin").addEventListener("click",()=>u.setView(u.lat,u.lon,u.zoom+1)),t("r-zout").addEventListener("click",()=>u.setView(u.lat,u.lon,u.zoom-1)),t("r-labels").addEventListener("click",A=>{let C=h("labels");C.enabled=C.enabled===!1,A.currentTarget.classList.toggle("on",C.enabled!==!1),u.invalidate()}),t("r-alerts").addEventListener("click",A=>{d=!d,A.currentTarget.classList.toggle("on",d),u.invalidate()});function L(A){if(r.view!=="radar"){v=A;return}let C=Math.min(.2,(A-v)/1e3);if(v=A,r.playing&&o.length){if(!l){if(y+=C,!u.tilesSettled("radar")&&y<da)return;l=!0}s+=C;let O=n===o.length-1?1.1:.42;if(s>=O){let E=-1;for(let D=1;D<=o.length;D++){let F=(n+D)%o.length;if(F===n||u.tilesSettled("radar",S(o[F]))){E=F;break}}if(E<0||E===n){s=O-.1;return}s=0,r.hours.length?r.setCursor(o[E].time*1e3):(n=E,T())}}}requestAnimationFrame(function A(C){requestAnimationFrame(A),L(C)}),r.on("loc",()=>{r.loc&&u.setView(r.loc.lat,r.loc.lon,7)}),r.on("radar",M);let R=(A,C)=>`<div class="kv"><dt>${A}</dt><dd>${C}</dd></div>`;return M(),{map:u,update(){k(),u.invalidate()},onShow(){l=!1,y=0,s=0,u.resize(),m.render(),c(),r.playing=!0,r.emit("play",!0),f()},onHide(){r.playing=!1,r.emit("play",!1),r.following&&r.setCursor(Date.now())}}}function ca(e,t){if(!e?.length)return null;let o=null,n=1/0;for(let s of e){let l=Math.abs(s.t-t);l<n&&(n=l,o=s)}return n<=36e5?o:null}function hn(e,t){for(let o of t){let n=e[o];if(n instanceof Date&&!Number.isNaN(+n))return{at:+n,kind:o}}return null}function ua(e,t,o,n,s){let l=hn(t,["night","nauticalDusk","dusk"]),y=hn(o,["nightEnd","nauticalDawn","dawn"]);if(!l||!y||y.at<=l.at)return{dark:null,samples:[],goodHours:0,score:0,reason:"no darkness"};let g=[],w=Math.ceil(l.at/36e5)*36e5;for(let $=w;$<=y.at;$+=36e5){let k=ca(e,$);if(!k)continue;let L=s($),R=n($)>0;g.push({t:$,cloud:k.cloud??null,moonUp:R,moonLit:L,washed:R&&L>=.25,clear:k.cloud!=null&&k.cloud<=30})}if(!g.length)return{dark:{from:l.at,to:y.at,kind:l.kind},samples:[],goodHours:0,score:0,reason:"beyond the forecast"};let v=$=>$.clear&&!$.washed,i=g.filter(v).length,u=g.filter($=>$.clear).length,S=g.filter($=>$.cloud!=null),h=S.length?S.reduce(($,k)=>$+k.cloud,0)/S.length:null,d=null,m=null;for(let $ of g.concat([null])){if($&&v($)){m=m||{from:$.t,to:$.t},m.to=$.t+36e5;continue}m&&(!d||m.to-m.from>d.to-d.from)&&(d=m),m=null}let a=(y.at-l.at)/36e5,c=s(l.at+(y.at-l.at)/2),f=g.filter($=>$.moonUp).length/g.length,p=d?(d.to-d.from)/36e5:0,T=.65*Math.min(1,p/4)+.25*Math.min(1,i/Math.max(a,1))+.1*Math.min(1,a/6),M=Math.round(100*Math.max(0,Math.min(1,T)-.08*f*c));return{dark:{from:l.at,to:y.at,kind:l.kind,hours:a},samples:g,goodHours:i,clearHours:u,cloudMean:h,moonLit:c,moonUpHours:g.filter($=>$.moonUp).length,best:d,score:M}}function fn(e,t,o,n,s,l=7,y=null){let{sunTimes:g,moonPosition:w,moonIllumination:v,toDeg:i}=s,u=[],S=y==null?(()=>{let m=new Date(n);return m.setHours(12,0,0,0),+m})():Math.floor((n+y)/(24*36e5))*24*36e5+12*36e5-y,h=m=>i(w(new Date(m),t,o).altitude),d=m=>v(new Date(m)).fraction;for(let m=0;m<l;m++){let a=new Date(S+m*24*36e5),c=new Date(S+(m+1)*24*36e5),f=ua(e,g(a,t,o),g(c,t,o),h,d);u.push({...f,index:m,day:+a})}return u}function uo(e){return e.slice(1).reduce((t,o)=>o.score>(t?.score??-1)?o:t,null)}function mn(e,t){let o=e[0],n=i=>t.hm(i);if(!o||!o.dark)return"No real darkness tonight at this latitude.";if(!o.samples.length)return"Tonight is beyond the forecast.";let s=uo(e),l=s&&s.score>o.score+15?s:null,y=i=>i.index===1?"Tomorrow":t.weekday(i.day),g=(i,u)=>`${i} ${u}${i===1?"":"s"}`,w=l?` ${y(l)} is the better night: ${g(l.goodHours,"clear moonless hour")}.`:"";if(o.best&&o.best.to-o.best.from>=2*36e5){let i=(o.best.to-o.best.from)/36e5,u=Math.round(i),S=o.moonLit>=.25&&o.moonUpHours?`, and the moon is ${Math.round(o.moonLit*100)}% lit`:"";if(o.dark.hours-i<1)return`Clear and moonless all night \u2014 about ${g(u,"hour")}, ${n(o.best.from)} to ${n(o.best.to)}${S}.`+w;if(u<3){let h=o.cloudMean!=null&&o.cloudMean>30?`, in a night averaging ${Math.round(o.cloudMean)}% cloud`:o.dark.hours<4?`, which is most of the ${g(Math.round(o.dark.hours),"hour")} of darkness`:"";return`A ${u}-hour window from ${n(o.best.from)}${h}${S}.`+w}return`Clear and moonless from ${n(o.best.from)} to ${n(o.best.to)} \u2014 about ${g(u,"hour")}${S}.`+w}return`Not tonight \u2014 ${o.cloudMean!=null&&o.cloudMean>30?`${Math.round(o.cloudMean)}% cloud through the dark hours`:o.moonUpHours&&o.moonLit>=.25?`a ${Math.round(o.moonLit*100)}% moon up for most of it`:"not much dark sky to work with"}.`+w}function pn(e){e.className="view skyview",e.innerHTML=`
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
  `;let t=a=>e.querySelector("#"+a),o=null;function n(){let{lat:a,lon:c}=r.loc||{lat:0,lon:0},f=r.fmt.isoDate(r.cursor),p=r.cursor;for(;r.fmt.isoDate(p-6e4)===f;)p-=6e4;let T=[],M=[];for(let $=0;$<=1440;$+=10){let k=new Date(p+$*6e4),L=xe(k,a,c),R=Ze(k,a,c);T.push({az:He(L.azimuth),alt:Fe(L.altitude),t:+k}),M.push({az:He(R.azimuth),alt:Fe(R.altitude),t:+k})}return{sun:T,moon:M,t0:p}}let s=le(t("s-dome"),(a,c,f,p)=>{let T=r.frame();if(!T)return;let{sun:M,moon:$}=n(),k=Math.min(c,f)/2-26,L=c/2,R=f/2;Go(a,L,R,k,{sunTrack:M,moonTrack:$,sun:{az:T.sun.compass,alt:T.sun.altDeg},moon:{az:T.moon.compass,alt:T.moon.altDeg},iss:o&&o.alt>0?o:null,night:T.sun.altDeg<-6?1:0}),a.save(),a.font="500 12px 'JetBrains Mono', monospace",a.textAlign="left",a.textBaseline="top";let A=[["SUN",`${T.sun.altDeg.toFixed(1)}\xB0  ${me(T.sun.compass)}`,"#f2b45a"],["MOON",`${T.moon.altDeg.toFixed(1)}\xB0  ${me(T.moon.compass)}`,"#7fb2f0"]];o&&A.push(["ISS",`${o.alt>0?`${o.alt.toFixed(0)}\xB0 ${me(o.az)}`:"below horizon"}`,"#8fdc6a"]),A.forEach(([C,O,E],D)=>{a.fillStyle=E,a.fillText(C,10,10+D*15),a.fillStyle=ve,a.fillText(O,52,10+D*15)}),a.restore()}),l=le(t("s-moon"),(a,c,f)=>{let p=r.frame();if(!p)return;let T=Math.min(c,f)/2-4;Nt(a,c/2,f/2,Math.max(10,T),p.moon.phase,p.moon.fraction)}),y=le(t("s-moonalt"),(a,c,f)=>{let{sun:p,moon:T}=n(),M={l:2,r:22,t:12,b:12},$={x:M.l,y:M.t,w:c-M.l-M.r,h:f-M.t-M.b};if($.w<30||$.h<20)return;let k=A=>$.y+$.h-(H(A,-60,90)+60)/150*$.h,L=A=>$.x+A/(T.length-1)*$.w;a.save(),a.strokeStyle="rgba(63,208,216,.30)",a.setLineDash([3,3]),a.beginPath(),a.moveTo($.x,k(0)),a.lineTo($.x+$.w,k(0)),a.stroke(),a.setLineDash([]),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="right",a.textBaseline="middle",a.fillText("0\xB0",$.x+$.w+18,k(0)),a.restore(),ke(a,p.map((A,C)=>[L(C),k(A.alt)]),"#f2b45a",{width:1.4,glow:6}),a.save(),a.setLineDash([3,3]),ke(a,T.map((A,C)=>[L(C),k(A.alt)]),"#7fb2f0",{width:1.6,glow:7}),a.restore();let R=H(Math.round((r.cursor-T[0].t)/(T.at(-1).t-T[0].t)*(T.length-1)),0,T.length-1);a.save(),a.strokeStyle=j[1],a.lineWidth=1,a.beginPath(),a.moveTo(L(R),$.y),a.lineTo(L(R),$.y+$.h),a.stroke(),a.restore(),a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="center",a.textBaseline="top";for(let A=0;A<=24;A+=6)A!==24&&Oe(a,String(A).padStart(2,"0"),L(A/24*(T.length-1)),f-M.b+1,0,c);a.restore(),Me(a,$.x+2,1,"altitude \u2014 sun solid, moon dashed")}),g=le(t("s-daybar"),(a,c,f)=>{let p=r.sunTimesFor(),T=r.fmt.isoDate(r.cursor),M=r.cursor;for(;r.fmt.isoDate(M-6e4)===T;)M-=6e4;let $=M+24*36e5,k=E=>(E-M)/($-M)*c,L=8,R=16,A=(E,D,F)=>{if(E==null||D==null||isNaN(+E)||isNaN(+D))return;let W=H(k(+E),0,c),U=H(k(+D),0,c);U<=W||(a.fillStyle=F,a.fillRect(W,L,U-W,R))};a.fillStyle="#0f1826",a.fillRect(0,L,c,R),A(p.nightEnd,p.nauticalDawn,"rgba(30,20,70,.9)"),A(p.nauticalDawn,p.dawn,"rgba(40,40,120,.9)"),A(p.dawn,p.sunrise,"rgba(90,60,150,.9)"),A(p.sunrise,p.goldenHourEnd,"rgba(245,154,91,.85)"),A(p.goldenHourEnd,p.goldenHour,"rgba(90,180,235,.75)"),A(p.goldenHour,p.sunset,"rgba(245,154,91,.85)"),A(p.sunset,p.dusk,"rgba(150,70,140,.9)"),A(p.dusk,p.nauticalDusk,"rgba(60,45,130,.9)"),A(p.nauticalDusk,p.night,"rgba(30,20,70,.9)"),a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="center",a.textBaseline="top",a.strokeStyle="rgba(255,255,255,.10)";for(let E=0;E<=24;E+=3){let D=E/24*c;a.beginPath(),a.moveTo(D,L+R),a.lineTo(D,L+R+3),a.stroke(),E%6===0&&E<24&&Oe(a,String(E).padStart(2,"0"),D,L+R+5,0,c)}a.restore();let C=(E,D,F)=>{if(E==null||isNaN(+E))return;let W=H(k(+E),6,c-6);a.save(),a.strokeStyle=F,a.lineWidth=1,a.beginPath(),a.moveTo(W,L-4),a.lineTo(W,L+R),a.stroke(),a.font="600 11.5px 'Chakra Petch', sans-serif",a.fillStyle=F,a.textAlign="center",a.textBaseline="bottom",a.fillText(D,W,L-5),a.restore()};C(p.sunrise,"\u2191","#f2b45a"),C(p.sunset,"\u2193","#f2b45a");let O=H(k(r.cursor),0,c);a.save(),a.strokeStyle=j[1],a.lineWidth=1.5,a.shadowColor=j[1],a.shadowBlur=4,a.beginPath(),a.moveTo(O,L-6),a.lineTo(O,L+R+2),a.stroke(),a.restore()}),w=le(t("s-kp"),(a,c,f,p)=>{let T=r.kpForecast();if(!T.length){v(a,c,f,"no space weather data");return}Jo(a,c,f,p,{rows:T,tf:r.fmt,now:Date.now()})});function v(a,c,f,p){a.save(),a.font="600 11.5px 'Chakra Petch', sans-serif",a.fillStyle=se,a.textAlign="center",a.textBaseline="middle",a.letterSpacing="1.6px",a.fillText(p.toUpperCase(),c/2,f/2),a.restore()}function i(a,c=Date.now()){let f=c,p=6*36e5,T=Je(new Date(f)).phase;for(let M=0;M<240;M++){f+=p;let $=Je(new Date(f)).phase;if(T<=a&&$>=a||T>$&&(T<=a||$>=a)){let L=f-p,R=f;for(let A=0;A<28;A++){let C=(L+R)/2,O=Je(new Date(C)).phase;O<a||O>.9&&a<.1?L=C:R=C}return(L+R)/2}T=$}return null}function u(){let a=r.frame();if(!a)return;let c=r.fmt;t("s-domewhen").textContent=r.atNow?"LIVE":`${c.weekday(r.cursor)} ${c.hm(r.cursor)}`;let f=r.moonTimesFor();t("s-mphase").textContent=bo(a.moon.phase).toUpperCase();let p=i(.5),T=i(0);t("s-moondl").innerHTML=`
      ${d("Illumination",`${(a.moon.fraction*100).toFixed(1)}%`)}
      ${d("Altitude",`${a.moon.altDeg.toFixed(1)}\xB0 ${me(a.moon.compass)}`)}
      ${d("Distance",`${Math.round(a.moon.distance).toLocaleString()} km`)}
      ${d("Moonrise",f.rise?c.hm(f.rise):f.alwaysUp?"always up":"\u2014")}
      ${d("Moonset",f.set?c.hm(f.set):f.alwaysDown?"never up":"\u2014")}
      ${d("Next full",p?`${c.monthDay(p)} ${c.hm(p)}`:"\u2014")}
      ${d("Next new",T?`${c.monthDay(T)} ${c.hm(T)}`:"\u2014")}
    `;let M=r.sunTimesFor(),$=a.day;t("s-daylen").textContent=$?.daylight?st($.daylight):"\u2014";let k="\u2014",L=r.days.findIndex(Z=>c.isoDate(Z.t)===c.isoDate(r.cursor));if(L>0&&r.days[L].daylight&&r.days[L-1].daylight){let Z=r.days[L].daylight-r.days[L-1].daylight,Q=Math.abs(Z)/60;k=`${Z>=0?"+":"\u2212"}${Math.floor(Q)}m ${Math.round(Q%1*60)}s vs yesterday`}t("s-sundl").innerHTML=`
      ${d("First light",c.hm(M.dawn))}
      ${d("Sunrise",c.hm(M.sunrise))}
      ${d("Golden hour ends",c.hm(M.goldenHourEnd))}
      ${d("Solar noon",`${c.hm(M.solarNoon)} \xB7 ${h().toFixed(1)}\xB0`)}
      ${d("Golden hour",c.hm(M.goldenHour))}
      ${d("Sunset",c.hm(M.sunset))}
      ${d("Civil dusk",c.hm(M.dusk))}
      ${d("Astronomical dark",isNaN(+M.night)?"none tonight":c.hm(M.night))}
      ${d("Day length",k)}
    `;let R=r.currentKp(),A=At(R);t("s-kpnow").textContent=R!=null?`Kp ${R.toFixed(2)} \xB7 ${A.name}`:"NO DATA";let C=r.space,O=C?.wind?.ok?C.wind.data?.[0]?.proton_speed:null,E=C?.mag?.ok?C.mag.data?.[0]?.bt:null,D=C?.mag?.ok?C.mag.data?.[0]?.bz_gsm:null,F=C?.scales?.ok?C.scales.data?.["0"]:null;t("s-spacedl").innerHTML=`
      ${d("Solar wind",O!=null?`${O} km/s`:"\u2014")}
      ${d("IMF Bt / Bz",E!=null?`${E} / ${D} nT`:"\u2014")}
      ${d("Aurora visible to",A.lat!=null?`${A.lat}\xB0 latitude`:"\u2014")}
      ${d("Your latitude",`${Math.abs(r.loc.lat).toFixed(1)}\xB0 ${r.loc.lat>=0?"N":"S"}`)}
      ${d("Radio / Solar / Geo",F?`R${F.R?.Scale??0} S${F.S?.Scale??0} G${F.G?.Scale??0}`:"\u2014")}
    `;let W=a.air,U=Wt("stargaze",{...a,air:W},{sunAltDeg:a.sun.altDeg,moonFraction:a.moon.fraction,moonUp:a.moon.altDeg>0}),P=U?.score??0,G=P>=75?N.good:P>=50?N.warn:P>=30?N.serious:N.crit;t("s-seenow").textContent=`${P}/100`;let te=r.hours.filter(Z=>Z.t>Date.now()&&Z.t<Date.now()+30*36e5),B=null;for(let Z of te){let Q=r.frame(Z.t);if(!Q||Q.sun.altDeg>-12)continue;let J=Wt("stargaze",Q,{sunAltDeg:Q.sun.altDeg,moonFraction:Q.moon.fraction,moonUp:Q.moon.altDeg>0});(!B||J.score>B.score)&&(B={t:Z.t,score:J.score,limiter:J.limiter})}t("s-seeing").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:5px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${G}">${P}</span>
        <span class="lbl">stargazing now</span>
      </div>
      <div class="meter" style="--ac:${G};margin-bottom:9px"><i style="width:${P}%"></i></div>
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
        ${B?`Best hour right now: <b style="color:${ve}">${c.weekday(B.t)} ${c.hm(B.t)}</b> at ${B.score}/100${B.limiter?`, held back by ${B.limiter}`:""}.`:"No astronomical darkness in the next 30 hours."}
      </div>`,S(),s.render(),l.render(),y.render(),g.render(),w.render()}function S(){let a=t("s-tonight");if(!r.loc||!r.hours?.length){a.innerHTML="";return}let c=r.fmt,f=fn(r.hours,r.loc.lat,r.loc.lon,Date.now(),{sunTimes:$t,moonPosition:Ze,moonIllumination:Je,toDeg:Fe}),p=uo(f),T=Math.max(4,...f.map($=>$.goodHours)),M=$=>{let k=p&&$.index===p.index&&$.score>f[0].score,L=$.score>=75?N.good:$.score>=45?N.warn:N.crit;return`
        <div class="tn-n${k?" pick":""}${$.index===0?" now":""}"
             title="${$.goodHours} clear moonless hours of ${$.dark?$.dark.hours.toFixed(1):0} dark">
          <span class="tn-h">${$.dark?`${$.goodHours}h`:"\u2014"}</span>
          <span class="tn-bar"><i style="height:${Math.round($.goodHours/T*100)}%;background:${L}"></i></span>
          <span class="tn-d">${c.weekday($.day).slice(0,3).toUpperCase()}</span>
        </div>`};a.innerHTML=`
      <p class="tn-verdict">${oe(mn(f,c))}</p>
      <div class="tn-week">${f.map(M).join("")}</div>
      <p class="tn-key">clear, moonless hours per night \xB7 next ${7}</p>`}function h(){let{lat:a,lon:c}=r.loc||{lat:0,lon:0},f=r.sunTimesFor();return!f.solarNoon||isNaN(+f.solarNoon)?0:Fe(xe(f.solarNoon,a,c).altitude)}let d=(a,c)=>`<div class="kv"><dt>${a}</dt><dd>${c}</dd></div>`;async function m(){if(r.view==="sky")try{let a=await ce.iss();if(a.pos?.ok){let c=a.pos.data,f=r.loc||{lat:0,lon:0};o={...mt(f.lat,f.lon,c.latitude,c.longitude,c.altitude),lat:c.latitude,lon:c.longitude,visibility:c.visibility},s.render()}}catch{}}return setInterval(m,8e3),{update:u,onShow(){m(),s.render(),l.render(),y.render(),g.render(),w.render()}}}var gn=[{key:"pm25",label:"PM2.5",unit:"\xB5g/m\xB3",ref:35,who:15,note:"fine particulate \u2014 lungs and bloodstream"},{key:"pm10",label:"PM10",unit:"\xB5g/m\xB3",ref:150,who:45,note:"coarse dust and pollen fragments"},{key:"o3",label:"Ozone",unit:"\xB5g/m\xB3",ref:140,who:100,note:"photochemical smog, peaks mid-afternoon"},{key:"no2",label:"NO\u2082",unit:"\xB5g/m\xB3",ref:200,who:25,note:"traffic and combustion"},{key:"so2",label:"SO\u2082",unit:"\xB5g/m\xB3",ref:350,who:40,note:"industry and shipping"},{key:"co",label:"CO",unit:"\xB5g/m\xB3",ref:1e4,who:4e3,note:"incomplete combustion"}],fa=["I very fair","II fair","III medium","IV olive","V brown","VI dark"];function vn(e){e.className="view airview",e.innerHTML=`
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
  `;let t=i=>e.querySelector("#"+i),o=le(t("a-gauge"),(i,u,S)=>{let d=r.frame()?.air?.aqi??r.airNow?.aqi,m=ze(d),a=Math.min(u,S)/2-22;je(i,u/2,S/2-4,Math.max(18,a),{value:d,min:0,max:300,color:m.color,label:"",unit:"US AQI",bands:[{from:0,to:50,color:N.good},{from:50,to:100,color:N.warn},{from:100,to:150,color:N.serious},{from:150,to:200,color:N.crit},{from:200,to:300,color:"#c89af5"}],ticks:6})}),n=le(t("a-uv"),(i,u,S,h)=>{let d=r.fmt.isoDate(r.cursor),m=r.hours.filter($=>r.fmt.isoDate($.t)===d);if(m.length<2)return;let a={l:2,r:24,t:12,b:14},c={x:a.l,y:a.t,w:u-a.l-a.r,h:S-a.t-a.b},f=$=>c.y+c.h-H($,0,12)/12*c.h;for(let[$,k,L]of[[3,N.good,"LOW"],[6,N.warn,"MOD"],[8,N.serious,"HIGH"],[11,N.crit,"V.HIGH"]])i.save(),i.strokeStyle=V(k,.3),i.setLineDash([3,3]),i.lineWidth=1,i.beginPath(),i.moveTo(c.x,f($)),i.lineTo(c.x+c.w,f($)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=V(k,.8),i.textAlign="right",i.textBaseline="bottom",Ae(i,L,c.x+c.w-2,f($)-1),i.restore();let p=m.length,T=Math.max(2,c.w/p-1.5);m.forEach(($,k)=>{let L=$.uv??0;if(L<=.03)return;let R=Ge(L).color;Ve(i,c.x+k*c.w/p,f(L),T,c.y+c.h,V(R,.85))});let M=m.map($=>[c.x+m.indexOf($)*c.w/p+T/2,f($.uvClear??0)]);i.save(),i.setLineDash([3,2]),i.strokeStyle=V(ve,.35),i.lineWidth=1,i.beginPath(),M.forEach(([$,k],L)=>L?i.lineTo($,k):i.moveTo($,k)),i.stroke(),i.restore(),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=se,i.textAlign="center",i.textBaseline="top",m.forEach(($,k)=>{let L=r.fmt.hourOfDay($.t);Math.round(L)%4||Math.abs(L-Math.round(L))>.02||Oe(i,r.fmt.hm($.t),c.x+k*c.w/p+T/2,S-a.b+3,0,u)}),i.restore(),Me(i,c.x+2,1,"uv index today \xB7 dashed = clear sky")}),s=le(t("a-fc"),(i,u,S,h)=>{let d=r.air.filter(L=>L.t>=Date.now()-216e5&&L.t<=Date.now()+3456e5);if(d.length<3){l(i,u,S,"no air quality forecast");return}let m={l:4,r:30,t:16,b:18},a={x:m.l,y:m.t,w:u-m.l-m.r,h:S-m.t-m.b},c=Math.max(110,Math.max(...d.map(L=>L.aqi??0))*1.15),f=L=>a.x+(L-d[0].t)/(d.at(-1).t-d[0].t)*a.w,p=L=>a.y+a.h-H(L,0,c)/c*a.h;for(let[L,R,A]of[[50,N.good,"GOOD"],[100,N.warn,"MODERATE"],[150,N.serious,"SENSITIVE"]])L>c||(i.save(),i.strokeStyle=V(R,.28),i.setLineDash([4,3]),i.beginPath(),i.moveTo(a.x,p(L)),i.lineTo(a.x+a.w,p(L)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=V(R,.85),i.textAlign="right",i.textBaseline="bottom",Ae(i,A,a.x+a.w-2,p(L)-2),i.restore());let T=d.length,M=Math.max(1,a.w/T-.5);d.forEach((L,R)=>{L.aqi!=null&&Ve(i,a.x+R*a.w/T,p(L.aqi),M,a.y+a.h,V(ze(L.aqi).color,.8),2)}),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=se,i.textAlign="center",i.textBaseline="top",i.strokeStyle="rgba(255,255,255,.07)";let $="";d.forEach((L,R)=>{let A=r.fmt.isoDate(L.t);if(A===$)return;$=A;let C=a.x+R*a.w/T;i.beginPath(),i.moveTo(C,a.y),i.lineTo(C,a.y+a.h),i.stroke(),C<a.x+a.w-20&&i.fillText(r.fmt.weekday(L.t).toUpperCase(),C+16,S-m.b+4)}),i.restore();let k=f(Date.now());if(k>a.x&&k<a.x+a.w&&(i.save(),i.strokeStyle=V(N.good,.85),i.setLineDash([3,3]),i.beginPath(),i.moveTo(k,a.y),i.lineTo(k,a.y+a.h),i.stroke(),i.restore()),Me(i,a.x+2,3,"us aqi \u2014 next 4 days"),h&&h.x>a.x&&h.x<a.x+a.w){let L=H(Math.round((h.x-a.x)/a.w*(T-1)),0,T-1),R=d[L],A=ze(R.aqi);i.save(),i.strokeStyle="rgba(255,255,255,.3)",i.beginPath(),i.moveTo(f(R.t),a.y),i.lineTo(f(R.t),a.y+a.h),i.stroke(),i.restore(),et(i,f(R.t),h.y,[`${r.fmt.weekday(R.t)} ${r.fmt.hm(R.t)}|`,`AQI|${Math.round(R.aqi??0)}`,`CATEGORY|${A.name}`,`PM2.5|${R.pm25?.toFixed(1)??"--"}`,`OZONE|${R.o3?.toFixed(0)??"--"}`],u,S,A.color,{pin:h.coarse})}});function l(i,u,S,h){i.save(),i.font="600 11.5px 'Chakra Petch', sans-serif",i.fillStyle=se,i.textAlign="center",i.textBaseline="middle",i.letterSpacing="1.6px",i.fillText(h.toUpperCase(),u/2,S/2),i.restore()}function y(){let i=r.frame();if(!i)return;let u=i.air||r.airNow,S=u?.aqi,h=ze(S);t("a-cat").textContent=h.name,t("a-cat").style.color=h.color,t("a-note").textContent=w(S);let d=null;if(u)for(let T of gn){let M=u[T.key];if(M==null)continue;let $=M/T.ref;(!d||$>d.frac)&&(d={...T,value:M,frac:$})}t("a-dl").innerHTML=`
      ${v("Dominant",d?`${d.label} ${d.value.toFixed(1)} ${d.unit}`:"\u2014")}
      ${v("PM2.5",u?.pm25!=null?`${u.pm25.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
      ${v("Ozone",u?.o3!=null?`${u.o3.toFixed(0)} \xB5g/m\xB3`:"\u2014")}
      ${v("Aerosol depth",u?.aod!=null?u.aod.toFixed(3):"\u2014")}
      ${v("Dust",u?.dust!=null?`${u.dust.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
    `,t("a-poll").innerHTML=gn.map(T=>{let M=u?.[T.key];if(M==null)return"";let $=H(M/T.ref*100,0,100),k=M>T.who,L=$>100?N.crit:$>66?N.serious:$>33?N.warn:N.good;return`
        <div style="margin-bottom:7px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
            <span class="lbl" style="color:var(--dim)">${T.label}</span>
            <span class="num" style="font-size:max(.72rem,var(--fs-floor,0px));color:${L}">${M.toFixed(M<10?1:0)}<span style="color:var(--faint);font-size:max(.85em,var(--fs-floor,0px))"> ${T.unit}</span></span>
          </div>
          <div class="meter" style="--ac:${L};margin:3px 0 2px;position:relative">
            <i style="width:${$}%"></i>
            <span style="position:absolute;left:${H(T.who/T.ref*100,0,100)}%;top:-2px;bottom:-2px;width:1px;background:rgba(255,255,255,.5)"></span>
          </div>
          <div style="font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint)">${T.note}${k?' \xB7 <b style="color:'+N.serious+'">above WHO guideline</b>':""}</div>
        </div>`}).join("")||'<div class="nodata">no pollutant data</div>',g();let m=i.uv;t("a-uvnow").textContent=m!=null?`${m.toFixed(1)} \xB7 ${Ge(m).name}`:"\u2014";let a=i.day?.uvMax;t("a-burn").innerHTML=m>0||a>0?`
      <div class="lbl" style="margin-bottom:4px">time to burn at today's peak (UV ${(a??m).toFixed(1)})</div>
      <div class="burngrid">
        ${fa.map((T,M)=>{let $=Et(a??m,M+1),k=$==null?pe:$<15?N.crit:$<30?N.serious:$<60?N.warn:N.good;return`<div><span class="lbl">${T}</span><b style="color:${k}">${$==null?"\u2014":$+"m"}</b></div>`}).join("")}
      </div>`:'<div class="nodata">no uv exposure right now</div>';let c=qe(i.dew);t("a-cmf").textContent=c.name;let f=i.feels,p=f!=null&&i.temp!=null?f-i.temp:null;t("a-comfort").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:6px">
        <span class="num" style="font-size:1.7rem;font-weight:700;color:${c.color}">${x.temp(i.dew)}</span>
        <span class="lbl">dew point</span>
      </div>
      <div class="dewstrip">
        ${[[-99,30,"VERY DRY"],[30,45,"DRY"],[45,55,"COMFORTABLE"],[55,60,"STICKY"],[60,65,"HUMID"],[65,70,"OPPRESSIVE"],[70,99,"MISERABLE"]].map(([M,$,k])=>`<i class="${i.dew!=null&&i.dew>=M&&i.dew<$?"on":""}" style="--c:${qe((M+$)/2).color}" title="${k}"></i>`).join("")}
      </div>
      <div style="display:flex;justify-content:space-between;font-size:max(.46rem,var(--fs-floor,0px));color:var(--faint);letter-spacing:.08em;margin-top:2px">
        <span>DRY</span><span>COMFORTABLE</span><span>OPPRESSIVE</span>
      </div>
      <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin:6px 0 8px">${c.note}</div>
      <dl style="margin:0">
        ${v("Air temperature",x.temp(i.temp))}
        ${v("Feels like",`${x.temp(i.feels)}${p!=null&&Math.abs(p)>=1?` (${x.signed(p,0)}\xB0)`:""}`)}
        ${v("Relative humidity",x.pct(i.rh))}
        ${v("Wet bulb",x.temp(i.wetbulb))}
        ${v("Vapour deficit",i.vpd!=null?`${i.vpd.toFixed(2)} kPa`:"\u2014")}
      </dl>
      <div style="font-size:max(.56rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Dew point predicts how the air feels far better than relative humidity,
        which only tells you how close the air is to saturation at its own temperature.
      </div>`,o.render(),n.render(),s.render()}function g(){let i=r.pollen,u=r.fmt;if(!i||i.source==="none"){let d=r.frame()?.air,m=d&&["grass","birch","alder","ragweed","olive","mugwort"].map(a=>[a,d[a]]).filter(([,a])=>a!=null);if(m?.length){t("a-polsrc").textContent="CAMS EUROPE",t("a-pollen").innerHTML=m.map(([a,c])=>`
          <div class="kv"><dt>${a}</dt><dd>${c.toFixed(1)} grains/m\xB3</dd></div>`).join("");return}t("a-polsrc").textContent="NO COVERAGE",t("a-pollen").innerHTML=`<div class="nodata">
        pollen data unavailable here<br><span style="color:var(--faint);text-transform:none;letter-spacing:0">
        ${oe(i?.reason||"no source covers this location")}</span></div>`;return}let S=pt(i.index),h=i.yesterday!=null&&i.index!=null?i.index-i.yesterday:null;t("a-polsrc").textContent=i.source.toUpperCase(),t("a-pollen").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${S.color}">${i.index?.toFixed(1)??"--"}</span>
        <div>
          <div class="chip" style="--ac:${S.color}">${S.name}</div>
          <div style="font-size:max(.54rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">of 12${h!=null?` \xB7 ${x.signed(h,1)} vs yesterday`:""}</div>
        </div>
      </div>
      <div class="meter" style="--ac:${S.color};margin:7px 0 9px"><i style="width:${H(i.index/12*100,0,100)}%"></i></div>
      ${i.triggers?.length?`
        <div class="lbl" style="margin-bottom:4px">today's triggers</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px">
          ${i.triggers.map(d=>`<span class="chip" style="--ac:var(--lm)">${oe(d.name)}</span>`).join("")}
        </div>`:""}
      ${i.forecast?.length?`
        <div class="lbl" style="margin-bottom:4px">5-day outlook</div>
        <div class="pollen-fc">
          ${i.forecast.map(d=>{let m=pt(d.index);return`<div>
              <span class="bar" style="height:${H(d.index/12*100,4,100)}%;--c:${m.color}"></span>
              <b>${d.index.toFixed(1)}</b>
              <span>${u.weekday(Date.parse(d.date))}</span>
            </div>`}).join("")}
        </div>`:""}`}function w(i){return i==null?"no measurement available":i<=50?"Air quality is satisfactory. No restrictions.":i<=100?"Acceptable. Unusually sensitive people may want to limit long outdoor exertion.":i<=150?"Sensitive groups \u2014 asthma, heart or lung conditions, children, older adults \u2014 should reduce prolonged exertion.":i<=200?"Everyone may begin to feel effects. Limit prolonged outdoor exertion.":i<=300?"Health alert. Avoid outdoor exertion; keep windows closed.":"Emergency conditions. Remain indoors with filtration if possible."}let v=(i,u)=>`<div class="kv"><dt>${i}</dt><dd>${u}</dd></div>`;return{update:y,onShow(){o.render(),n.render(),s.render()}}}function yn(e){e.className="view dataview",e.innerHTML=`
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
  `;let t=h=>e.querySelector("#"+h),o=h=>ko(h,r.tz);function n(){let h=r.fmt.isoDate(Date.now()),d=r.days.find(m=>r.fmt.isoDate(m.t)===h);return d?d.t:Date.now()-12*36e5}function s(h,d,m,a){h.save(),h.font="600 11.5px 'Chakra Petch', sans-serif",h.fillStyle=se,h.textAlign="center",h.textBaseline="middle",h.letterSpacing="1.6px",h.fillText(a.toUpperCase()+" \u2026",d/2,m/2),h.restore()}let l=le(t("d2-clim"),(h,d,m,a)=>{if(!r.climate){s(h,d,m,"loading 30-year archive");return}Zo(h,d,m,a,{days:r.days.filter(c=>c.t>=n()),climate:r.climate,tf:r.fmt,doyOf:o})}),y=le(t("d2-spread"),(h,d,m,a)=>{if(!r.models){s(h,d,m,"loading model ensemble");return}xo(h,d,m,a,{rows:r.models.rows,tf:r.fmt,now:Date.now()})}),g=le(t("d2-meteo"),(h,d,m,a)=>{Ht(h,d,m,a,{hours:r.hours,days:r.days,tf:r.fmt,span:{lo:r.cursor-24*36e5,hi:r.cursor+96*36e5},cursor:r.cursor,now:Date.now(),panels:["pressure","cloud","uv","cape"]})},{onPick:({x:h,w:d})=>{let m=r.cursor-864e5,a=r.cursor+96*36e5;r.playing=!1,r.scrubTo(m+(h-4)/(d-34)*(a-m))}}),w=le(t("d2-trend"),(h,d,m,a)=>{let c=r.climate?.annual;if(!c?.length){s(h,d,m,"loading climate record");return}let f={l:4,r:34,t:16,b:18},p={x:f.l,y:f.t,w:d-f.l-f.r,h:m-f.t-f.b};if(p.w<40||p.h<30)return;let T=c.map(Y=>Y.mean),M=Math.min(...T)-.4,$=Math.max(...T)+.4,k=Y=>p.x+Y/(c.length-1)*p.w,L=Y=>p.y+p.h-(Y-M)/($-M)*p.h;Ce(h,p,We(M,$,Be(p.h,3)).map(Y=>({v:Y,y:L(Y)})),Y=>`${Y.toFixed(1)}\xB0`);let R=T.reduce((Y,ue)=>Y+ue,0)/T.length,A=Math.max(2,p.w/c.length-2);c.forEach((Y,ue)=>{let Re=Y.mean-R,de=Re>=0?_e("#8d9aab","#f2b45a",H(Math.abs(Re)/1.6,0,1)):_e("#8d9aab","#7fb2f0",H(Math.abs(Re)/1.6,0,1)),b=L(R),I=L(Y.mean);h.fillStyle=V(de,.9),h.fillRect(k(ue)-A/2,Math.min(b,I),A,Math.max(1.5,Math.abs(I-b)))});let C=c.length,O=c.reduce((Y,ue)=>Y+ue.year,0)/C,E=R,D=0,F=0;for(let Y of c)D+=(Y.year-O)*(Y.mean-E),F+=(Y.year-O)**2;let W=F?D/F:0,U=c.map((Y,ue)=>[k(ue),L(E+W*(Y.year-O))]);h.save(),h.setLineDash([5,3]),ke(h,U,W>=0?"#f2b45a":"#7fb2f0",{width:2,glow:10}),h.restore(),h.save(),h.font="500 11.5px 'JetBrains Mono', monospace",h.fillStyle=se,h.textAlign="center",h.textBaseline="top";let P=5*Rt(Math.ceil(c.length/5),p.w,h.measureText("2020").width);c.forEach((Y,ue)=>{Y.year%P||Oe(h,String(Y.year),k(ue),m-f.b+4,0,d)}),h.restore(),h.save(),h.font="600 11.5px 'Chakra Petch', sans-serif",h.letterSpacing="1.2px";let G=`TREND ${W>=0?"+":"\u2212"}${Math.abs(W*10).toFixed(2)}\xB0F / DECADE`,te=h.measureText(G).width;h.fillStyle=W>=0?"#f2b45a":"#7fb2f0",h.textAlign="right",h.textBaseline="top",h.fillText(G,p.x+p.w,3),h.restore(),h.save(),h.font=ye,h.letterSpacing="1.4px";let B="annual mean temperature \xB0F",Z="annual mean \xB0F",Q=Y=>h.measureText(Y.toUpperCase()).width,J=Q(B)+te+14<=p.w?B:Q(Z)+te+14<=p.w?Z:null;if(h.restore(),J&&Me(h,p.x+2,3,J),a&&a.x>p.x&&a.x<p.x+p.w){let Y=H(Math.round((a.x-p.x)/p.w*(c.length-1)),0,c.length-1),ue=c[Y];h.save(),h.fillStyle="rgba(22,33,47,.94)",h.strokeStyle=V(j[0],.5);let Re=`${ue.year}  ${ue.mean.toFixed(2)}\xB0F  ${ue.mean-R>=0?"+":"\u2212"}${Math.abs(ue.mean-R).toFixed(2)} vs period mean`;h.font="500 11.5px 'JetBrains Mono', monospace";let de=h.measureText(Re).width+14,b=H(k(Y)-de/2,4,Math.max(4,d-de-4)),I=a.coarse&&a.y<m/2?p.y+p.h-20:p.y+2;h.beginPath(),h.rect(b,I,de,18),h.fill(),h.stroke(),h.fillStyle=ve,h.textAlign="left",h.textBaseline="middle",h.fillText(Re,b+7,I+9),h.restore()}});function v(){let h=r.fmt,d=r.climate,m=r.dayFor(r.cursor),a=d?.doy?.[o(r.cursor)];if(t("d2-yrs").textContent=d?`${d.years} YEARS \xB7 ${d.start.slice(0,4)}\u2013${d.end.slice(0,4)}`:"\u2014",a&&m){let C=m.tmax-a.normalHigh,O=m.tmin-(a.normalLow??m.tmin),E=H((m.tmax-a.normalHigh)/Math.max(.1,a.recordHigh-a.normalHigh)*100,0,100);t("d2-rec").innerHTML=`
        <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin-bottom:7px">
          ${h.weekday(r.cursor)} ${h.monthDay(r.cursor)} \xB7 forecast against every
          ${h.monthDay(r.cursor)} since ${d.start.slice(0,4)}
        </div>
        <dl style="margin:0">
          ${S("Forecast high",x.temp(m.tmax),C>=0?"#f2b45a":"#7fb2f0")}
          ${u("Normal high",`${x.temp(a.normalHigh)}  (${x.signed(C)}\xB0)`)}
          ${S("Record high",`${x.temp(a.recordHigh)} in ${a.recordHighYear}`,m.tmax>=a.recordHigh?N.crit:pe)}
          ${u("Forecast low",x.temp(m.tmin))}
          ${u("Normal low",`${x.temp(a.normalLow)}  (${x.signed(O)}\xB0)`)}
          ${S("Record low",`${x.temp(a.recordLow)} in ${a.recordLowYear}`,m.tmin<=a.recordLow?j[4]:pe)}
        </dl>
        <div class="lbl" style="margin:9px 0 3px">high, normal \u2192 record</div>
        <div class="meter" style="--ac:${E>85?N.crit:N.serious}">
          <i style="width:${E}%"></i></div>
        <div style="display:flex;justify-content:space-between;font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">
          <span>${x.temp(a.normalHigh)} normal</span><span>${x.temp(a.recordHigh)} record</span>
        </div>
        <dl style="margin:9px 0 0">
          ${u("Historically wet",`${Math.round(a.wetFrac*100)}% of years`)}
          ${u("Mean precip",`${a.meanPrecip.toFixed(3)} in`)}
          ${u("Forecast precip",`${(m.precip??0).toFixed(2)} in`)}
        </dl>`}else t("d2-rec").innerHTML='<div class="nodata">climate archive loading\u2026</div>';let c=Date.now(),f=r.hours.filter(C=>C.t<=c&&C.t>=c-720*36e5),p=0,T=0,M=0;for(let C of r.days){if(C.tmax==null||C.tmin==null)continue;let O=(C.tmax+C.tmin)/2;C.t>c||(p+=Math.max(0,65-O),T+=Math.max(0,O-65),M+=Math.max(0,Math.min(O,86)-50))}let $=r.models?.rows?.find(C=>C.t>=c),k=$?$.spread<2?["HIGH",N.good]:$.spread<5?["MODERATE",N.warn]:$.spread<9?["LOW",N.serious]:["VERY LOW",N.crit]:null,L=r.models?.rows?.find(C=>C.t>=c+168*36e5),R=r.days.filter(C=>C.t>c).reduce((C,O)=>C+(O.precip??0),0),A=r.days.filter(C=>C.t>c&&(C.precip??0)>=.01).length;t("d2-derived").innerHTML=`
      <dl style="margin:0">
        ${u("Pressure now",`${x.pressure(r.frame()?.pressure)} inHg`)}
        ${u("3h tendency",i())}
        ${k?S("Forecast confidence",`${k[0]} \xB7 \xB1${($.spread/2).toFixed(1)}\xB0`,k[1]):""}
        ${L?u("Day-7 model spread",`${L.spread.toFixed(1)}\xB0`):""}
        ${u("16-day precip total",`${R.toFixed(2)} in`)}
        ${u("Wet days ahead",`${A} of ${r.days.filter(C=>C.t>c).length}`)}
      </dl>
      <div class="lbl" style="margin:9px 0 3px">degree days, window shown</div>
      <dl style="margin:0">
        ${u("Heating (base 65\xB0F)",Math.round(p))}
        ${u("Cooling (base 65\xB0F)",Math.round(T))}
        ${u("Growing (50/86\xB0F)",Math.round(M))}
      </dl>
      <div style="font-size:max(.55rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Degree days accumulate how far each day's mean sits from a base
        temperature \u2014 the standard proxy for heating load, cooling load and
        crop development.
      </div>`,l.render(),y.render(),w.render(),g.render()}function i(){let h=r.cursor,d=r.hours.find(f=>f.t>=h-3*36e5),m=r.hours.find(f=>f.t>=h);if(!d?.pressure||!m?.pressure)return"\u2014";let a=(m.pressure-d.pressure)*.029529983,c=Math.abs(a)<.02?"steady":Math.abs(a)<.06?"slow":Math.abs(a)<.12?"moderate":"rapid";return`${x.signed(a,3)} inHg \xB7 ${a>0?"rising":a<0?"falling":""} ${c}`.trim()}let u=(h,d)=>`<div class="kv"><dt>${h}</dt><dd>${d}</dd></div>`,S=(h,d,m)=>`<div class="kv"><dt>${h}</dt><dd style="color:${m}">${d}</dd></div>`;return{update:v,onShow(){l.render(),y.render(),w.render(),g.render()}}}var nt=null,ma=()=>nt?Promise.resolve(nt):import("./sats.OZS22OPN.js").then(e=>nt=e),wn=1852,pa=1e4,bn=24,Mn="atmos.sats.v1",ga=5e3,Sn=2,$n=(e,t)=>t?se:_e("#f07aa6","#3fd0d8",H((e??0)/38e3,0,1));function kn(e){e.className="view overheadview",e.innerHTML=`
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
  `;let t=b=>e.querySelector("#"+b),o=[],n=0,s=null,l=null,y=null,g=null,w=null,v=!1,i=Object.fromEntries(Ie.map(b=>[b.key,b.on]));try{let b=JSON.parse(localStorage.getItem(Mn)||"null");if(b&&typeof b=="object")for(let I of Ie)typeof b[I.key]=="boolean"&&(i[I.key]=b[I.key])}catch{}let u={},S=[],h=null,d=0,m=null,a=[],c=()=>r.loc||{lat:0,lon:0},f=new ct(t("o-map"),{center:[c().lat,c().lon],zoom:9,minZoom:5,maxZoom:12,onTap:b=>p(b)});f.layers=[{name:"base",url:(b,I,q)=>`${ut}/World_Dark_Gray_Base/MapServer/tile/${b}/${q}/${I}`,filter:jt,opacity:1},{name:"labels",url:(b,I,q)=>`${ut}/World_Dark_Gray_Reference/MapServer/tile/${b}/${q}/${I}`,filter:Kt,opacity:.85}],f.overlays.push((b,I)=>{let q=c(),[z,_]=I.project(q.lat,q.lon),K=156543.03392*Math.cos(I.lat*Math.PI/180)/Math.pow(2,I.zoom);b.save(),b.strokeStyle="rgba(63,208,216,.13)",b.setLineDash([2,4]),b.lineWidth=1,b.font="500 11.5px 'JetBrains Mono', monospace",b.fillStyle=j[0],b.textAlign="center",b.textBaseline="bottom";for(let X of[10,20,40]){let ee=X*wn/K;ee<24||ee>Math.max(I.w,I.h)||(b.beginPath(),b.arc(z,_,ee,0,Math.PI*2),b.stroke(),Ae(b,`${X} NM`,z,_-ee-2))}b.restore();for(let X of v?[]:o){let[ee,ne]=I.project(X.lat,X.lon);if(ee<-20||ne<-20||ee>I.w+20||ne>I.h+20)continue;let fe=X.hex===l,Se=$n(X.alt,X.gnd);if(fe){let Le=(X.gs??0)/60;if(Le>.1&&X.trk!=null){let yo=Le*wn/K,wo=(X.trk-90)*Math.PI/180;b.save(),b.strokeStyle=V(Se,.6),b.setLineDash([3,3]),b.lineWidth=1.2,b.beginPath(),b.moveTo(ee,ne),b.lineTo(ee+Math.cos(wo)*yo,ne+Math.sin(wo)*yo),b.stroke(),b.restore()}b.save(),b.strokeStyle=Se,b.lineWidth=1.5,b.shadowColor=Se,b.shadowBlur=5,b.beginPath(),b.arc(ee,ne,13,0,Math.PI*2),b.stroke(),b.restore()}if(b.save(),b.translate(ee,ne),b.rotate((X.trk??0)*Math.PI/180),b.fillStyle=Se,fe&&(b.shadowColor=Se,b.shadowBlur=4),b.beginPath(),b.moveTo(0,-6.5),b.lineTo(4.5,5),b.lineTo(0,2.4),b.lineTo(-4.5,5),b.closePath(),b.fill(),b.restore(),fe&&X.cs){b.save(),b.font="600 11.5px 'Chakra Petch', sans-serif",b.letterSpacing="1.2px",b.textAlign="left",b.textBaseline="middle";let Le=b.measureText(X.cs).width+10;b.fillStyle="rgba(22,33,47,.88)",b.fillRect(ee+16,ne-7,Le,14),b.fillStyle=Se,b.fillText(X.cs,ee+21,ne),b.restore()}}v&&te(b,I),r.loc&&Yt(b,z,_,"#f07aa6",null),xt(b,I,12,I.h-12)});function p(b){if(v){let z=null,_=bn;for(let K of S){let[X,ee]=f.project(K.p.lat,K.p.lon),ne=Math.hypot(X-b.x,ee-b.y);ne<_&&(_=ne,z=K)}B(z?z.sat.id:null);return}let I=null,q=bn;for(let z of o){let[_,K]=f.project(z.lat,z.lon),X=Math.hypot(_-b.x,K-b.y);X<q&&(q=X,I=z)}T(I?I.hex:null)}function T(b){if(l===b||(l=b,y=null,L(),f.invalidate(),!b))return;let I=o.find(q=>q.hex===b);I&&ce.flight(I.cs||"",I.hex||"").then(q=>{l===b&&(y=q,L())}).catch(()=>{})}let M=(b,I)=>`<div class="kv"><dt>${b}</dt><dd>${I}</dd></div>`,$=b=>b==null?"\u2014":`${Math.round(b).toLocaleString()} ft`;function k(b,I){let q=c(),z=Math.PI/180,_=(I-q.lon)*z,K=Math.sin(_)*Math.cos(b*z),X=Math.cos(q.lat*z)*Math.sin(b*z)-Math.sin(q.lat*z)*Math.cos(b*z)*Math.cos(_);return(Fe(Math.atan2(K,X))+360)%360}function L(){if(v){Q();return}let b=o.find(ee=>ee.hex===l);if(!b){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap an aircraft on the map, or a row in NEAREST.</p>';return}t("o-cs").textContent=b.cs||b.reg||b.hex.toUpperCase();let I=b.vs==null||Math.abs(b.vs)<100?"level":b.vs>0?`climbing ${Math.round(b.vs).toLocaleString()} ft/min`:`descending ${Math.abs(Math.round(b.vs)).toLocaleString()} ft/min`,q=k(b.lat,b.lon),z=[],_=y;_?.airline?z.push(M("Operator",oe(_.airline))):_?.aircraft?.owner&&z.push(M("Operator",oe(_.aircraft.owner)));let K=_?.aircraft?.manufacturer&&_?.aircraft?.type?`${_.aircraft.manufacturer} ${_.aircraft.type}`:b.type;if(K&&z.push(M("Aircraft",oe(K))),b.reg&&z.push(M("Registration",oe(b.reg))),_?.origin||_?.destination){let ee=ne=>ne?`${oe(ne.iata||"??")} <span class="dim">${oe(ne.city||"")}</span>`:"\u2014";z.push(M("From",ee(_.origin))),z.push(M("To",ee(_.destination)))}z.push(M("Altitude",b.gnd?"on the ground":$(b.alt))),z.push(M("Motion",`${b.gs==null?"\u2014":`${Math.round(b.gs)} kt`} \xB7 ${I}`)),z.push(M("Heading",b.trk==null?"\u2014":`${Math.round(b.trk)}\xB0 ${me(b.trk)}`)),z.push(M("From you",`${(b.dst??0).toFixed(1)} nm ${me(q)}`));let X=_&&!_.origin&&b.cs?'<p class="hint">No published route \u2014 usually private or general aviation.</p>':_?.origin?'<p class="hint">Route is by callsign, which airlines reuse day to day.</p>':"";t("o-sel").innerHTML=z.join("")+X}function R(){if(v){J();return}t("o-neartitle").textContent="NEAREST";let b=o.filter(I=>!I.gnd).slice(0,8);if(t("o-src").textContent=s?s.toUpperCase():"NO FEED",!b.length){t("o-near").innerHTML='<p class="hint">Nothing in the air within range.</p>';return}t("o-near").innerHTML='<div class="oh-head"><span>callsign</span><span>type</span><span>range</span><span>alt</span></div>'+b.map(I=>`
      <button class="oh-row" data-hex="${oe(I.hex)}" aria-pressed="${I.hex===l}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${$n(I.alt,I.gnd)} 80%, var(--ink))">${oe(I.cs||I.reg||I.hex)}</span>
        <span class="oh-t">${oe(I.type||"")}</span>
        <span class="oh-d">${(I.dst??0).toFixed(1)} nm</span>
        <span class="oh-a">${I.alt==null?"\u2014":`${(I.alt/1e3).toFixed(1)}k`}</span>
      </button>`).join("");for(let I of t("o-near").querySelectorAll(".oh-row"))I.addEventListener("click",()=>{T(I.dataset.hex),R()})}function A(){let b=c(),I=new Date(r.cursor),q=xe(I,b.lat,b.lon),z=Ze(I,b.lat,b.lon),_=(ee,ne,fe,Se)=>{let Le=ne>0;return`<div class="kv"><dt style="color:${Se}">${ee}</dt><dd>${Le?`${ne.toFixed(0)}\xB0 up, ${me(fe)}`:'<span class="dim">below the horizon</span>'}</dd></div>`},K=[_("Sun",Fe(q.altitude),He(q.azimuth),"#f2b45a"),_("Moon",Fe(z.altitude),He(z.azimuth),"#7fb2f0")];K.push(g&&g.alt>0?_("ISS",g.alt,g.az,"#8fdc6a"):`<div class="kv"><dt style="color:#8fdc6a">ISS</dt><dd><span class="dim">${g?`below the horizon, ${g.range.toLocaleString()} km away`:"no fix"}</span></dd></div>`);let X=Math.abs(r.cursor-Date.now());t("o-lookwhen").textContent=X<6*6e4?"NOW":`${r.fmt.weekday(r.cursor)} ${r.fmt.hm(r.cursor)}`,t("o-sky").innerHTML=K.join("")+'<p class="hint">Aircraft positions from adsb.lol under ODbL; routes and airframes from adsbdb. Both are run by volunteers.</p>'}function C(){if(v){Y();return}let b=o.filter(q=>!q.gnd).length;t("o-count").textContent=`${b} AIRCRAFT`;let I=n?Math.round((Date.now()-n)/1e3):null;t("o-age").textContent=I==null?"\u2014":I<20?"LIVE":`${I}s AGO`}async function O(){if(!(v||r.view!=="overhead"||!r.loc))try{let b=await ce.aircraft(r.loc.lat,r.loc.lon,60);o=b.aircraft||[],n=b.at||Date.now(),s=b.source,l&&!o.some(I=>I.hex===l)&&T(null),C(),R(),L(),f.invalidate()}catch{}}async function E(){if(!(r.view!=="overhead"||!r.loc))try{let b=await ce.iss();if(b.pos?.ok){let I=b.pos.data;g=mt(r.loc.lat,r.loc.lon,I.latitude,I.longitude,I.altitude),A()}}catch{}}let D=b=>Ie.find(I=>I.key===b),F=b=>`${b.lat.toFixed(1)},${b.lon.toFixed(1)}`,W=b=>b<1?`${Math.max(1,Math.round(b*60))} min`:b<48?`${Math.round(b)} h`:`${Math.round(b/24)} days`;async function U(b){let I=u[b.key];if(!(I&&(I.state==="ok"||I.state==="loading"))){u[b.key]={state:"loading",sats:[],fetched:null};try{await ma();let q=new Map,z=1/0;for(let _ of b.groups){let K=await fetch(new URL(`/sats/${_}.json`,location.origin));if(!K.ok)throw new Error(`${_} -> ${K.status}`);let X=await K.json(),ee=Date.parse(X.fetched);Number.isFinite(ee)&&(z=Math.min(z,ee));for(let ne of nt.prepare(X.records,b.key))q.set(ne.id,ne)}if(!q.size)throw new Error("empty");u[b.key]={state:"ok",sats:[...q.values()],fetched:Number.isFinite(z)?z:null}}catch{u[b.key]={state:"fail",sats:[],fetched:null}}G(!0),ue(),R(),L(),C(),f.invalidate()}}let P={};function G(b){if(!v)return;let I=r.cursor,q=c(),z=[];for(let K of Ie){let X=u[K.key];if(!i[K.key]||!X||X.state!=="ok")continue;let ee=P[K.key],ne=K.key==="starlink";if(!b&&ne&&ee&&Math.abs(I-ee.at)<ga){z.push(...ee.list);continue}let fe=[];for(let Se of X.sats){let Le=nt.positionAt(Se,I);Le&&fe.push({sat:Se,p:Le,cat:K,look:mt(q.lat,q.lon,Le.lat,Le.lon,Le.altKm)})}P[K.key]={at:I,list:fe},z.push(...fe)}S=z;let _=S.find(K=>K.sat.id===h);a=_?nt.groundTrack(_.sat,I,90,60):[]}function te(b,I){let q=256*Math.pow(2,I.zoom),z=S.find(_=>_.sat.id===h);for(let _ of[-q,0,q]){if(z&&a.length){b.save(),b.strokeStyle=V(z.cat.colour,.7),b.setLineDash([4,4]),b.lineWidth=1.4;for(let K of a)b.beginPath(),K.forEach(([X,ee],ne)=>{let[fe,Se]=I.project(X,ee);ne?b.lineTo(fe+_,Se):b.moveTo(fe+_,Se)}),b.stroke();b.restore()}for(let K of S){let[X,ee]=I.project(K.p.lat,K.p.lon),ne=X+_;if(ne<-6||ee<-6||ne>I.w+6||ee>I.h+6)continue;let fe=K.cat.key==="starlink";b.fillStyle=K.cat.colour,b.beginPath(),b.arc(ne,ee,fe?1.7:3.2,0,Math.PI*2),b.fill()}if(z){let[K,X]=I.project(z.p.lat,z.p.lon),ee=K+_;if(ee<-40||X<-20||ee>I.w+40||X>I.h+20)continue;b.save(),b.strokeStyle=z.cat.colour,b.lineWidth=1.5,b.shadowColor=z.cat.colour,b.shadowBlur=5,b.beginPath(),b.arc(ee,X,10,0,Math.PI*2),b.stroke(),b.restore(),b.save(),b.font="600 11.5px 'Chakra Petch', sans-serif",b.letterSpacing="1.2px",b.textAlign="left",b.textBaseline="middle";let ne=b.measureText(z.sat.name).width+10;b.fillStyle="rgba(22,33,47,.88)",b.fillRect(ee+14,X-7,ne,14),b.fillStyle=z.cat.colour,b.fillText(z.sat.name,ee+19,X),b.restore()}}}function B(b){h!==b&&(h=b,G(!1),L(),R(),f.invalidate())}let Z=b=>S.filter(I=>F(I.p)===F(b.p)&&I.sat.id!==b.sat.id);function Q(){let b=S.find(fe=>fe.sat.id===h);if(!b){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap a dot on the map, or a row in ABOVE YOU.</p>';return}let{sat:I,p:q,look:z,cat:_}=b;t("o-cs").textContent=I.name;let K=[M("Kind",oe(kt(I.name))),M("Group",oe(_.label)),M("NORAD ID",String(I.id))];I.intl&&K.push(M("Launch",oe(I.intl))),K.push(M("Altitude",`${Math.round(q.altKm).toLocaleString()} km`)),K.push(M("Over",`${Math.abs(q.lat).toFixed(1)}\xB0${q.lat<0?"S":"N"} ${Math.abs(q.lon).toFixed(1)}\xB0${q.lon<0?"W":"E"}`)),K.push(M("From you",z.alt>0?`${z.alt.toFixed(0)}\xB0 up, ${me(z.az)}`:`<span class="dim">below the horizon, ${z.range.toLocaleString()} km away</span>`));let X=nt.elementAgeHours(I,r.cursor);K.push(M("Elements",`${X<0?"newer than":""} ${W(Math.abs(X))} ${X<0?"ahead":"old"}`.trim()));let ee=Z(b),ne=ee.length?`<p class="hint">Same orbit data, so same position: ${ee.slice(0,6).map(fe=>oe(fe.sat.name)).join(", ")}${ee.length>6?` and ${ee.length-6} more`:""}. Docked craft share the station's elements.</p>`:"";t("o-sel").innerHTML=K.join("")+ne+'<p class="hint">Dashed line: next 90 minutes of ground track. Kind is read from the catalogue name.</p>'}function J(){t("o-neartitle").textContent="ABOVE YOU",t("o-src").textContent="CELESTRAK";let b=new Set,I=S.filter(_=>_.look.alt>0).sort((_,K)=>K.look.alt-_.look.alt),q=[];for(let _ of I){let K=F(_.p);if(!b.has(K)&&(b.add(K),q.push({q:_,extra:Z(_).length}),q.length>=8))break}let z=Ie.some(_=>i[_.key]&&u[_.key]?.state==="ok");if(!q.length){t("o-near").innerHTML=`<p class="hint">${z?"Nothing in the chosen groups is above your horizon right now.":"Switch on a group above to see what is overhead."}</p>`;return}t("o-near").innerHTML='<div class="oh-head"><span>name</span><span>type</span><span>up</span><span>dir</span></div>'+q.map(({q:_,extra:K})=>`
      <button class="oh-row" data-sat="${_.sat.id}" aria-pressed="${_.sat.id===h}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${_.cat.colour} 80%, var(--ink))">${oe(_.sat.name)}${K?` +${K}`:""}</span>
        <span class="oh-t">${kt(_.sat.name)==="satellite"?"":oe(kt(_.sat.name))}</span>
        <span class="oh-d">${_.look.alt.toFixed(0)}\xB0</span>
        <span class="oh-a">${me(_.look.az)}</span>
      </button>`).join("");for(let _ of t("o-near").querySelectorAll(".oh-row"))_.addEventListener("click",()=>B(Number(_.dataset.sat)))}function Y(){let b=Ie.filter(q=>i[q.key]&&u[q.key]?.state==="ok");t("o-count").textContent=`${S.length.toLocaleString()} SATELLITES`;let I=b.map(q=>u[q.key].fetched).filter(Boolean);t("o-age").textContent=I.length?`ELEMENTS ${W((Date.now()-Math.min(...I))/36e5).toUpperCase()} OLD`:"\u2014"}function ue(){let b=Ie.some(z=>i[z.key]&&u[z.key]?.state==="loading"),I=Ie.some(z=>i[z.key]&&u[z.key]?.state==="fail");t("o-satstate").textContent=v?b?"LOADING":I?"NO DATA":`${S.length.toLocaleString()} SHOWN`:"OFF";let q=z=>{let _=u[z.key],K=!v||!i[z.key]?"":_?.state==="loading"?" \u2026":_?.state==="fail"?" \u2715":_?.state==="ok"?` ${_.sats.length.toLocaleString()}`:"";return`<button class="oh-chip" data-cat="${z.key}" aria-pressed="${!!i[z.key]}" style="--chip:${z.colour}">${oe(z.label)}${K}</button>`};t("o-satui").innerHTML=`
      <button class="oh-chip oh-mode" data-mode="1" aria-pressed="${v}">${v?"Back to aircraft":"Show satellites on map"}</button>
      <div class="oh-chips">${Ie.map(q).join("")}</div>
      ${I?'<p class="hint">Satellite elements are not available here. They are published to branyontech.com every two hours.</p>':""}
      ${v&&i.starlink?'<p class="hint">Starlink is thousands of objects: a large download, loaded only when on.</p>':""}
      ${v?'<p class="hint">Elements: CelesTrak. Positions computed here (SGP4).</p>':""}`}function Re(){try{localStorage.setItem(Mn,JSON.stringify(i))}catch{}}function de(b){if(v!==b){if(v=b,clearInterval(m),m=null,b){T(null),f.minZoom=1;let I=c();f.setView(H(I.lat*.5,-40,40),I.lon,Sn);for(let q of Ie)i[q.key]&&U(q);r.view==="overhead"&&(m=setInterval(()=>{G(!1),Y(),R(),f.invalidate()},1e3)),G(!0)}else h=null,a=[],S=[],f.minZoom=5,f.setView(c().lat,c().lon,9),O();ue(),L(),R(),C(),f.invalidate()}}return t("o-satui").addEventListener("click",b=>{let I=b.target.closest("button");if(!I)return;if(I.dataset.mode){de(!v);return}let q=D(I.dataset.cat);q&&(i[q.key]=!i[q.key],Re(),v&&i[q.key]&&U(q),G(!0),h!=null&&!S.some(z=>z.sat.id===h)&&(h=null),ue(),L(),R(),C(),f.invalidate())}),t("o-center").addEventListener("click",()=>{r.loc&&(v?f.setView(H(r.loc.lat*.5,-40,40),r.loc.lon,Sn):f.setView(r.loc.lat,r.loc.lon,9))}),t("o-zin").addEventListener("click",()=>f.setView(f.lat,f.lon,f.zoom+1)),t("o-zout").addEventListener("click",()=>f.setView(f.lat,f.lon,f.zoom-1)),r.on("loc",()=>{if(r.loc){if(v){G(!0),R(),f.invalidate(),E();return}f.setView(r.loc.lat,r.loc.lon,9),O(),E()}}),L(),A(),ue(),r.on("cursor",()=>{r.view==="overhead"&&(A(),v&&(G(!1),L(),R(),f.invalidate()))}),{map:f,update(){A(),f.invalidate()},onShow(){f.resize(),O(),E(),clearInterval(w),w=setInterval(()=>{O(),C()},pa),v&&!m&&(m=setInterval(()=>{G(!1),Y(),R(),f.invalidate()},1e3))},onHide(){clearInterval(w),w=null,clearInterval(m),m=null}}}var re=null,Ue=null,Zt=!1,De=null,va=0,bt=1/0;function Tn(e,t=4){let o=e.createBuffer(1,e.sampleRate*t,e.sampleRate),n=o.getChannelData(0);for(let s=0;s<n.length;s++)n[s]=Math.random()*2-1;return o}function ho(e,t,{type:o,freq:n,q:s,gain:l}){let y=e.createBufferSource();y.buffer=Tn(e),y.loop=!0;let g=e.createBiquadFilter();g.type=o,g.frequency.value=n,g.Q.value=s;let w=e.createGain();return w.gain.value=l,y.connect(g).connect(w).connect(t),y.start(),{src:y,filt:g,gain:w}}function En(){if(re)return;let e=window.AudioContext||window.webkitAudioContext;if(!e)return;re=new e,Ue=re.createGain(),Ue.gain.value=0;let t=re.createDynamicsCompressor();t.threshold.value=-18,t.ratio.value=6,t.attack.value=.004,t.release.value=.25,Ue.connect(t).connect(re.destination);let o=ho(re,Ue,{type:"bandpass",freq:1400,q:.7,gain:0}),n=ho(re,Ue,{type:"highpass",freq:4200,q:.5,gain:0}),s=ho(re,Ue,{type:"bandpass",freq:420,q:1.6,gain:0}),l=re.createOscillator(),y=re.createGain();l.frequency.value=.07,y.gain.value=180,l.connect(y).connect(s.filt.frequency),l.start();let g=re.createGain();g.gain.value=0;let w=re.createBiquadFilter();w.type="lowpass",w.frequency.value=480,w.Q.value=.6,w.connect(g).connect(Ue);let v=[0,3.5].map(i=>{let u=re.createOscillator();u.type="sawtooth",u.frequency.value=55,u.detune.value=i;let S=re.createGain();return S.gain.value=.22,u.connect(S).connect(w),u.start(),u});De={rain:o,patter:n,wind:s,drone:{oscs:v,gain:g,filt:w},lfo:l,lfoGain:y}}function at(){return Zt}function An(e){Zt=e,re&&(e&&re.state==="suspended"&&re.resume(),Ke(Ue.gain,e?.5:0,e?1.2:.6))}var Ke=(e,t,o=.6)=>{let n=re.currentTime;e.cancelScheduledValues(n),e.setValueAtTime(e.value,n),e.linearRampToValueAtTime(t,n+o)};function ya(e=.5){if(!re||!Zt)return;let t=re.currentTime,o=re.createBufferSource();o.buffer=Tn(re,3);let n=re.createBiquadFilter();n.type="lowpass",n.frequency.setValueAtTime(700-e*480,t),n.Q.value=.5;let s=re.createGain(),l=.55*(1-e*.65);s.gain.setValueAtTime(1e-4,t),s.gain.exponentialRampToValueAtTime(Math.max(.02,l),t+.04+e*.3),s.gain.exponentialRampToValueAtTime(1e-4,t+1.6+e*2.4),o.connect(n).connect(s).connect(Ue),o.start(t),o.stop(t+4.2)}function Ln(e){if(!re||!Zt||!De)return;let t=e.frame();if(!t)return;let o=t.wx.kind,n=Math.min(1,Math.max((t.precip??0)/.1,o==="rain"||o==="storm"?t.wx.intensity*.5:0)),s=Math.min(1,(t.wind??0)/32),l=Math.min(1,((t.gust??t.wind??0)-(t.wind??0))/18);Ke(De.rain.gain.gain,n*.3,.9),Ke(De.rain.filt.frequency,900+n*1500,.9),Ke(De.patter.gain.gain,n*n*.1,.9),Ke(De.wind.gain.gain,s*.24,1.1),Ke(De.wind.filt.Q,1.2+l*2.5,1.1),De.lfo.frequency.value=.05+l*.22,De.lfoGain.gain.value=120+l*420;let y=t.temp??60,g=44+Math.max(0,Math.min(1,(y-20)/80))*26;for(let i of De.drone.oscs)i.frequency.setTargetAtTime(g,re.currentTime,1.5);Ke(De.drone.gain.gain,.055+(t.sun.altDeg>0?.02:.05),2),Ke(De.drone.filt.frequency,300+Math.max(0,t.sun.altDeg)*9,2);let w=o==="storm"?.9:Math.min(.6,(t.cape??0)/2500),v=performance.now();w>.15?(bt===1/0&&(bt=v+Math.random()*6e3),v>bt&&(ya(Math.random()*(1-w*.6)),bt=v+3e3+Math.random()*22e3*(1.1-w))):bt=1/0,va=w}function wa(e){let t=e.fmt,o=e.frame(Date.now());if(!o)return[];let n=[],s=o.day,l=Date.now();n.push({tone:"lead",text:`${t.full(l)}. It is ${x.temp(o.temp)} and ${o.wx.long.toLowerCase()} in ${e.loc.name}`+(Math.abs((o.feels??o.temp)-o.temp)>=3?`, feeling like ${x.temp(o.feels)}`:"")+"."});for(let m of e.alerts.slice(0,3))n.push({tone:"alert",text:`${m.event} in effect until ${t.weekday(m.expires)} ${t.hm12(m.expires)}.`+(m.instruction?` ${ba(m.instruction)}`:"")});if(s){let m=e.climate?.doy?.[Ma(e,l)],a=`Today runs ${x.temp(s.tmin)} to ${x.temp(s.tmax)}`;if(m){let c=s.tmax-m.normalHigh;Math.abs(c)>=3?a+=`, ${Math.abs(c).toFixed(0)}\xB0 ${c>0?"above":"below"} the normal high of ${x.temp(m.normalHigh)}`:a+=", right about normal",s.tmax>=m.recordHigh&&(a+=`. That would tie or beat the record of ${x.temp(m.recordHigh)} set in ${m.recordHighYear}`)}n.push({tone:"body",text:a+"."})}let y=yt(e);if(y?.raining)n.push({tone:"wet",text:y.minutes!=null?`It is raining now and should ease within ${y.minutes} minutes.`:"It is raining now, with no break in the next six hours."});else if(y?.minutes!=null&&y.minutes<=240)n.push({tone:"wet",text:`Rain arrives in about ${y.minutes} minutes, around ${t.hm12(y.changeAt)}.`});else{let m=e.hours.find(a=>a.t>l&&(a.pop??0)>=40);m?n.push({tone:"body",text:`Dry for now. The next real chance of rain is ${t.weekday(m.t)} around ${t.hm12(m.t)}, at ${Math.round(m.pop)} percent.`}):n.push({tone:"body",text:"No meaningful rain anywhere in the sixteen-day window."})}let g=Math.max(...e.hours.filter(m=>m.t>l&&m.t<l+24*36e5).map(m=>m.gust??0),0);g>=22&&n.push({tone:"warn",text:`Wind is worth planning around: gusts reach ${Math.round(g)} miles per hour today, ${Lt(g).effect}.`});let w=qe(o.dew);["STICKY","HUMID","OPPRESSIVE","MISERABLE","LETHAL"].includes(w.name)?n.push({tone:"warn",text:`The air is ${w.name.toLowerCase()} \u2014 dew point ${x.temp(o.dew)}, ${w.note}.`}):w.name==="VERY DRY"&&n.push({tone:"body",text:`Very dry air, dew point ${x.temp(o.dew)}. Expect static and chapped lips.`});let v=s?.uvMax;if(v!=null&&v>=6){let m=Math.round(350/(v*15));n.push({tone:"warn",text:`UV peaks at ${v.toFixed(1)}, ${Ge(v).name.toLowerCase()}. Unprotected skin burns in roughly ${m} minutes.`})}let i=o.air?.aqi??e.airNow?.aqi;i!=null&&i>75&&n.push({tone:"warn",text:`Air quality is ${ze(i).name.toLowerCase()} at ${Math.round(i)} on the US index.`});let u=e.pollen;if(u?.index!=null&&u.index>=7){let m=(u.triggers||[]).map(a=>a.name).slice(0,3).join(", ");n.push({tone:"warn",text:`Pollen is ${pt(u.index).name.toLowerCase().replace("-"," to ")} at ${u.index.toFixed(1)} of 12${m?`, driven by ${m}`:""}.`})}let S=_t.map(m=>({k:m,w:Ut(m,e,{hours:24,limit:1,minScore:62})[0]})).filter(m=>m.w).sort((m,a)=>a.w.peak-m.w.peak).slice(0,2);for(let m of S){let a=Bt(m.k);n.push({tone:"good",text:`Best window to ${a.label.toLowerCase()}: ${t.weekday(m.w.start)} ${t.hm12(m.w.start)} to ${t.hm12(m.w.end)}, scoring ${m.w.peak} out of 100.`})}let h=e.currentKp();if(h!=null&&h>=5){let m=At(h);n.push({tone:"space",text:`Geomagnetic activity is elevated: Kp ${h.toFixed(1)}, ${m.name}. Aurora may be visible to about ${m.lat} degrees latitude.`})}let d=e.sunTimesFor(l);return n.push({tone:"body",text:`Sunset is at ${t.hm12(d.sunset)}, with golden hour beginning ${t.hm12(d.goldenHour)}`+(s?.daylight?` and ${st(s.daylight)} of daylight today`:"")+"."}),n}var ba=e=>{let t=String(e).replace(/\s+/g," ").match(/^.{0,180}?[.!?](\s|$)/);return(t?t[0]:String(e).slice(0,180)).trim()};function Ma(e,t){let[,o,n]=e.fmt.isoDate(t).split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][o-1]+n-1}var Sa={lead:"var(--cy)",alert:"var(--rd)",warn:"var(--am)",wet:"var(--ice)",good:"var(--lm)",space:"var(--vi)",body:"var(--ink)"};function fo(e,t){let o=wa(e);t(`
    <div class="hd">BRIEFING<span class="rule"></span>
      <span class="val">${oe(e.loc.name.toUpperCase())} \xB7 ${e.fmt.hm(Date.now())}</span></div>
    <div class="res-list" style="max-height:60vh">
      ${o.map((n,s)=>`
        <p style="
          margin:0 0 10px;
          font-size:${s===0?".92rem":".8rem"};
          line-height:1.6;
          color:${Sa[n.tone]||"var(--ink)"};
          ${n.tone==="alert"?"border-left:2px solid var(--rd);padding-left:10px;":""}
          ${s===0?"font-weight:600;":""}
        ">${oe(n.text)}</p>`).join("")}
    </div>
    <div style="display:flex;gap:6px;margin-top:12px">
      <button class="tl-btn" id="speakBtn">\u25B6 SPEAK</button>
      <button class="tl-btn" id="stopBtn">\u25A0 STOP</button>
    </div>
  `,n=>{let s=()=>{if(!window.speechSynthesis)return;speechSynthesis.cancel();let l=o.map(w=>w.text).join(" "),y=new SpeechSynthesisUtterance(l);y.rate=1.02,y.pitch=.85;let g=speechSynthesis.getVoices().find(w=>/en[-_](GB|US)/.test(w.lang)&&w.localService);g&&(y.voice=g),speechSynthesis.speak(y)};n.querySelector("#speakBtn").addEventListener("click",s),n.querySelector("#stopBtn").addEventListener("click",()=>speechSynthesis?.cancel()),e.settings.voice&&setTimeout(s,220)})}function Cn(e,t,o){let n=t.ownerDocument,s='a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]',l=null,y=!1,g=()=>[...t.querySelectorAll(s)].filter(h=>h.tabIndex>=0&&!h.matches(":disabled")&&!h.closest("[hidden], [inert]")&&h.getClientRects().length&&n.defaultView.getComputedStyle(h).visibility!=="hidden").sort((h,d)=>(h.tabIndex||1/0)-(d.tabIndex||1/0)),w=()=>(g()[0]||t).focus();function v(h){!e.hidden&&!t.contains(h.target)&&w()}function i(h){if(e.hidden||h.defaultPrevented||h.isComposing)return;if(h.key==="Escape"){h.preventDefault(),h.stopPropagation(),S();return}if(h.key!=="Tab"||h.ctrlKey||h.metaKey||h.altKey)return;let d=g(),m=d[0],a=d.at(-1);m?(!d.includes(n.activeElement)||(h.shiftKey?n.activeElement===m:n.activeElement===a))&&(h.preventDefault(),(h.shiftKey?a:m).focus()):(h.preventDefault(),t.focus({preventScroll:!0}))}function u(h,d,m){e.hidden&&(l=m||n.activeElement,y=o?.inert||!1,o&&(o.inert=!0),n.addEventListener("keydown",i,!0),n.addEventListener("focusin",v)),t.innerHTML=h;let a=t.querySelector(".hd");a?(a.id||="modalTitle",t.setAttribute("aria-labelledby",a.id),t.removeAttribute("aria-label")):(t.removeAttribute("aria-labelledby"),t.setAttribute("aria-label","Weather dialog")),e.hidden=!1,e.scrollTop=t.scrollTop=0,d&&d(t),t.contains(n.activeElement)||w()}function S(){if(e.hidden)return;e.hidden=!0,n.removeEventListener("keydown",i,!0),n.removeEventListener("focusin",v),t.innerHTML="",o&&(o.inert=y);let h=l;l=null,h?.isConnected&&!h.closest("[inert]")&&h.focus({preventScroll:!0})}return e.addEventListener("click",h=>{h.target===e&&S()}),{open:u,close:S}}var go=["deck","radar","sky","air","data","overhead"],$a=5*6e4,he={sky:document.getElementById("sky"),boot:document.getElementById("boot"),bootLog:document.getElementById("bootLog"),led:document.getElementById("led"),locBtn:document.getElementById("locBtn"),locName:document.getElementById("locName"),locSub:document.getElementById("locSub"),nav:document.getElementById("nav"),clockTime:document.getElementById("clockTime"),clockZone:document.getElementById("clockZone"),alertBtn:document.getElementById("alertBtn"),soundBtn:document.getElementById("soundBtn"),briefBtn:document.getElementById("briefBtn"),cfgBtn:document.getElementById("cfgBtn"),scrub:document.getElementById("scrub"),modal:document.getElementById("modal"),modalCard:document.getElementById("modalCard")},Ye=new Pt(he.sky),Rn=null,Ne={},Nn=Cn(he.modal,he.modalCard,document.getElementById("app")),Dn=[];function Te(e,t=""){Dn.push(t?`<span class="${t}">${e}</span>`:e),he.bootLog.innerHTML=Dn.join(`
`)}async function ka(){Te("ATMOS//NET v1.0.0"),Te('<span class="mut">initialising atmospheric console\u2026</span>'),Ro();let e=new URLSearchParams(location.search).get("q");e!==null&&/^[0-3]$/.test(e)&&ro(+e),Te(`render tier ${ae.tier} \xB7 ${ae.onBattery?"battery":"AC power"}`,"ok");let t=Ye.init();Ye.setQuality(ae.tier),Te(t?"webgl2 sky renderer online":"webgl2 unavailable \u2014 sky disabled",t?"ok":"err"),ae.onChange(l=>Ye.setQuality(l));let o=r.loc,n=null;o?Te(`location: ${oe(o.name)}`):(n=await ce.config(),o=n.home,Te(`no saved location \u2014 using ${oe(o.name)}`)),Te('<span class="mut">contacting feeds\u2026</span>'),await r.setLocation(o,{remember:!n?.public});let s=r.raw;Te(`open-meteo forecast  ${s?.forecast?.ok?"OK":"FAIL"}`,s?.forecast?.ok?"ok":"err"),Te(`open-meteo air       ${s?.air?.ok?"OK":"FAIL"}`,s?.air?.ok?"ok":"err"),Te(`nws alerts           ${s?.alerts?.ok?"OK":"FAIL"}`,s?.alerts?.ok?"ok":"err"),Te(`noaa swpc space wx   ${s?.space?.ok?"OK":"FAIL"}`,s?.space?.ok?"ok":"err"),Te(`${r.hours.length} hourly steps \xB7 ${r.days.length} days \xB7 ${r.min15.length} 15-min steps`,"ok"),Ta(),Te("console ready","ok"),setTimeout(()=>{he.boot.classList.add("done");let l=r.skyParams();l&&Ye.snap(l)},0),Hn(),setInterval(()=>{document.hidden||r.refresh()},$a),La(n)}function In(e,t,o){Object.defineProperty(Ne,e,{configurable:!0,enumerable:!0,get(){let n=t(document.getElementById(o));return Object.defineProperty(Ne,e,{value:n,configurable:!0,enumerable:!0,writable:!0}),n}})}function Ta(){Rn=Ko(he.scrub),Ne.deck=rn(document.getElementById("view-deck")),Ne.sky=pn(document.getElementById("view-sky")),Ne.air=vn(document.getElementById("view-air")),Ne.data=yn(document.getElementById("view-data")),In("radar",un,"view-radar"),In("overhead",kn,"view-overhead");let e=()=>{let o=Ne[r.view];o?.update&&o.update()};r.on("data",()=>{e(),mo()}),r.on("cursor",()=>{e(),St()}),r.on("climate",e),r.on("models",e),r.on("pollen",e),r.on("observed",e),r.on("radar",e),r.on("loc",mo),r.on("status",o=>{he.led.dataset.state=o==="ok"?"":o}),he.nav.addEventListener("click",o=>{let n=o.target.closest("button[data-view]");n&&Mt(n.dataset.view)}),he.locBtn.addEventListener("click",Fn),he.alertBtn.addEventListener("click",zn),he.briefBtn.addEventListener("click",()=>fo(r,ft)),he.cfgBtn.addEventListener("click",_n),he.soundBtn.addEventListener("click",vo),document.addEventListener("visibilitychange",()=>{document.hidden||(Jt=0,r.syncToNow())}),window.addEventListener("resize",()=>{Ye.resize()}),document.addEventListener("keydown",Ca),window.addEventListener("hashchange",()=>Mt(location.hash.slice(1),{push:!1}));let t=location.hash.slice(1);go.includes(t)&&t!=="deck"?Mt(t):document.documentElement.style.setProperty("--stage-dim","0.25"),mo(),e()}function mo(){let e=r.loc;e&&(he.locName.textContent=e.name,he.locSub.textContent=[e.admin1,e.country].filter(Boolean).join(" \xB7 ")||`${e.lat.toFixed(2)}, ${e.lon.toFixed(2)}`),he.clockZone.textContent=r.tz.split("/").pop().replace(/_/g," "),he.alertBtn.dataset.n=String(r.alerts.length),he.soundBtn.classList.toggle("on",at())}function Mt(e,{push:t=!0}={}){if(!go.includes(e)||r.view===e)return;Ne[r.view]?.onHide?.(),r.view=e,_o();let o=Ne[e];t&&location.hash.slice(1)!==e&&history.replaceState(null,"","#"+e);for(let n of he.nav.querySelectorAll("button"))n.setAttribute("aria-selected",String(n.dataset.view===e));for(let n of document.querySelectorAll(".view"))n.classList.toggle("active",n.dataset.view===e);document.documentElement.style.setProperty("--stage-dim",e==="deck"?"0.25":"0.72"),o?.update&&o.update(),o?.onShow&&o.onShow()}var Pn=performance.now(),po=0,Jt=0,Ea=20;function Hn(e=performance.now()){requestAnimationFrame(Hn);let t=Math.min(.1,(e-Pn)/1e3);Pn=e,Oo(t),document.hidden||(Ye.render(e,t),Rn?.tick(t),Jt+=t,Jt>Ea&&(Jt=0,r.syncToNow()),po+=t,(r.playing||po>.25)&&(po=0,St()),Aa(e),Ln(r))}function St(){let e=r.skyParams();e&&Ye.set(e)}var On=0;function Aa(e){e-On<500||(On=e,he.clockTime.textContent=r.fmt.hms(Date.now()))}function ft(e,t,o){Nn.open(e,t,o)}function Qt(){Nn.close()}function Fn(){ft(`
    <div class="hd">LOCATION<span class="rule"></span><span class="val">ENTER TO SELECT \xB7 ESC TO CLOSE</span></div>
    <input class="search-input" id="q" placeholder="search any city, or paste  lat, lon" autocomplete="off" spellcheck="false">
    <button class="tl-btn" id="useloc" style="margin-top:8px">\u25CE USE MY LOCATION</button>
    <div class="res-list" id="res"></div>
  `,e=>{let t=e.querySelector("#q"),o=e.querySelector("#res"),n=[],s=0,l=null,y=()=>{n=r.favorites.map(i=>({...i,fav:!0})),g("SAVED")},g=i=>{if(!n.length){o.innerHTML=`<h3>${i}</h3><div class="nodata">no results</div>`;return}o.innerHTML=`<h3>${i}</h3>`+n.map((u,S)=>`
        <div class="res-item ${S===s?"sel":""}" data-i="${S}">
          <div>
            <b>${ht(u.name)}</b><br>
            <span>${ht([u.admin1,u.country||u.country_code].filter(Boolean).join(" \xB7 "))}</span>
          </div>
          <span class="coord">${(+u.latitude).toFixed(2)}, ${(+u.longitude).toFixed(2)}</span>
          ${u.fav?`<button class="rm" data-rm="${S}" title="Remove">\xD7</button>`:""}
        </div>`).join("")},w=async i=>{let u=n[i];u&&(r.addFavorite(u),Qt(),await r.setLocation(u),St())};o.addEventListener("click",i=>{let u=i.target.closest("[data-rm]");if(u){i.stopPropagation(),r.removeFavorite(+u.dataset.rm),y();return}let S=i.target.closest("[data-i]");S&&w(+S.dataset.i)}),t.addEventListener("input",()=>{clearTimeout(l);let i=t.value.trim();if(!i){y();return}let u=i.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);if(u){let S=+u[1],h=+u[2];if(Math.abs(S)<=90&&Math.abs(h)<=180){n=[{name:`${S.toFixed(4)}, ${h.toFixed(4)}`,admin1:"coordinate",latitude:S,longitude:h}],s=0,g("COORDINATE");return}}l=setTimeout(async()=>{try{n=(await ce.geocode(i)).results||[],s=0,g("RESULTS")}catch{n=[],g("RESULTS")}},220)}),t.addEventListener("keydown",i=>{i.key==="ArrowDown"?(s=Math.min(n.length-1,s+1),g(o.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="ArrowUp"?(s=Math.max(0,s-1),g(o.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="Enter"&&(w(s),i.preventDefault())});let v=e.querySelector("#useloc");!navigator.geolocation||!window.isSecureContext?v.remove():v.addEventListener("click",()=>{v.textContent="\u25CE LOCATING\u2026",navigator.geolocation.getCurrentPosition(async i=>{let u=i.coords.latitude,S=i.coords.longitude,h=`${u.toFixed(2)}, ${S.toFixed(2)}`,d="",m="";try{let a=await ce.reverse(u,S);h=a.city||a.locality||a.principalSubdivision||h,d=a.principalSubdivision||"",m=a.countryCode||""}catch{}r.settings.geo="set",Qt(),await r.setLocation({name:h,admin1:d,country_code:m,latitude:u,longitude:S}),St()},i=>{v.textContent=i.code===i.PERMISSION_DENIED?"\u25CE LOCATION BLOCKED IN BROWSER":"\u25CE LOCATION UNAVAILABLE"},{timeout:8e3,maximumAge:30*6e4})}),y(),t.focus()})}function zn(){let e=r.alerts;if(!e.length){ft(`<div class="hd">ALERTS<span class="rule"></span></div>
      <div class="nodata">no active watches, warnings or advisories for this location</div>`);return}ft(`
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
  `)}function _n(e){let t=ae.manual;ft(`
    <div class="hd">SETTINGS<span class="rule"></span><span class="val">ATMOS//NET v1.0.0</span></div>
    <div class="setrow">
      <label>Render quality<span class="hint">Auto adapts to power state and measured frame rate</span></label>
      <div class="seg" id="qseg">
        ${["auto","0","1","2","3"].map(o=>`<button data-q="${o}" class="${String(t)===o||t==null&&o==="auto"?"on":""}">${o}</button>`).join("")}
      </div>
    </div>
    <div class="setrow">
      <label>Ambient audio<span class="hint">Generative soundscape matched to live conditions</span></label>
      <div class="seg"><button id="sndT" class="${at()?"on":""}">${at()?"on":"off"}</button></div>
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
  `,o=>{o.querySelector("#qseg").addEventListener("click",n=>{let s=n.target.closest("[data-q]");s&&(ro(s.dataset.q==="auto"?null:+s.dataset.q),o.querySelectorAll("[data-q]").forEach(l=>l.classList.toggle("on",l===s)))}),o.querySelector("#sndT").addEventListener("click",n=>{vo(),n.target.textContent=at()?"on":"off",n.target.classList.toggle("on",at())}),o.querySelector("#voiceT").addEventListener("click",n=>{r.settings.voice=!r.settings.voice,r.save(),n.target.textContent=r.settings.voice?"on":"off",n.target.classList.toggle("on",r.settings.voice)})},e?.currentTarget)}function vo(){let e=!at();En(),An(e),r.settings.sound=e,r.save(),he.soundBtn.classList.toggle("on",e)}function La(e){e?.public&&(r.settings.geo||!navigator.geolocation||!window.isSecureContext||navigator.geolocation.getCurrentPosition(async t=>{let o=t.coords.latitude,n=t.coords.longitude,s=`${o.toFixed(2)}, ${n.toFixed(2)}`,l="",y="";try{let g=await ce.reverse(o,n);s=g.city||g.locality||g.principalSubdivision||s,l=g.principalSubdivision||"",y=g.countryCode||""}catch{}r.settings.geo="set",await r.setLocation({name:s,admin1:l,country_code:y,latitude:o,longitude:n}),St()},t=>{t.code===t.PERMISSION_DENIED&&(r.settings.geo="denied",r.save())},{timeout:8e3,maximumAge:30*6e4,enableHighAccuracy:!1}))}function Ca(e){if(e.defaultPrevented||e.isComposing)return;if(e.target.closest?.('input, textarea, select, button, a[href], summary, [contenteditable], [role="button"], [role="link"], [role="slider"], [role="textbox"], [role="combobox"]')){e.key==="Escape"&&Qt();return}if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest?.('[aria-modal="true"]'))return;let t=e.key;if(t==="Escape"){Qt();return}if(t>="1"&&t<="6"){Mt(go[+t-1]);return}switch(t.toLowerCase()){case" ":r.playing=!r.playing,r.playing&&r.view!=="radar"&&(r.following=!1),r.playing&&r.cursor>=r.span.hi-6e4&&r.setCursor(Date.now()),r.emit("play",r.playing),e.preventDefault();break;case"arrowleft":r.playing=!1,r.scrubTo(r.cursor-(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"arrowright":r.playing=!1,r.scrubTo(r.cursor+(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"n":r.toNow();break;case"/":Fn(),e.preventDefault();break;case"a":zn();break;case"b":fo(r,ft);break;case"s":vo();break;case",":_n();break;case"r":r.refresh();break;case"f":document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();break;default:break}}var ht=oe;ka().catch(e=>{console.error(e),Te(`FATAL: ${e.message}`,"err")});window.ATMOS={store:r,sky:Ye,perf:ae,setView:Mt,views:Ne};export{Qt as closeModal,ft as openModal};
