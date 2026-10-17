import{a as xe,b as He,c as Fe,d as $t,e as mt,f as Ze,g as Je,h as bo,i as Mo,j as Ie,k as kt}from"./chunk.7JX7BFLW.js";var _n=new URL("./",location.href);async function be(e,t){let o=new URL(e.replace(/^\//,""),_n);for(let[s,l]of Object.entries(t||{}))l!=null&&o.searchParams.set(s,l);let n=await fetch(o,{cache:"no-store"});if(!n.ok)throw new Error(`${e} -> ${n.status}`);return n.json()}var ce={config:()=>be("/api/config"),bundle:(e,t)=>be("/api/bundle",{lat:e,lon:t}),climate:(e,t)=>be("/api/climate",{lat:e,lon:t}),models:(e,t)=>be("/api/models",{lat:e,lon:t}),pollen:(e,t)=>be("/api/pollen",{lat:e,lon:t}),observations:(e,t)=>be("/api/observations",{lat:e,lon:t}),radar:()=>be("/api/radar"),space:()=>be("/api/space"),aurora:()=>be("/api/aurora"),iss:()=>be("/api/iss"),aircraft:(e,t,o)=>be("/api/aircraft",{lat:e,lon:t,dist:o}),flight:(e,t)=>be("/api/flight",{cs:e,hex:t}),elsewhere:e=>be("/api/elsewhere",{q:e}),geocode:e=>be("/api/geocode",{q:e}),reverse:(e,t)=>be("/api/reverse",{lat:e,lon:t})};var Bn={"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"},te=e=>String(e??"").replace(/[<>&"']/g,t=>Bn[t]),H=(e,t,o)=>Math.min(o,Math.max(t,e)),Tt=(e,t,o)=>e+(t-e)*o;var Z={temp:e=>e==null?"--":`${Math.round(e)}\xB0`,tempP:e=>e==null?"--":`${e.toFixed(1)}\xB0`,pct:e=>e==null?"--":`${Math.round(e)}%`,wind:e=>e==null?"--":`${Math.round(e)}`,pressure:e=>e==null?"--":(e*.029529983071445).toFixed(2),inches:e=>e==null?"--":e<.01&&e>0?"<0.01":e.toFixed(2),miles:e=>e==null?"--":e>=1609*9?"10+":(e/1609.344).toFixed(1),int:e=>e==null?"--":String(Math.round(e)),signed:(e,t=1)=>e==null?"--":`${e>=0?"+":"\u2212"}${Math.abs(e).toFixed(t)}`},Wn=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"],me=e=>e==null?"--":Wn[Math.round((e%360+360)%360/22.5)%16];function st(e){if(e==null)return"--";let t=Math.floor(e/3600),o=Math.round(e%3600/60);return t?`${t}h ${String(o).padStart(2,"0")}m`:`${o}m`}function Xt(e){let t=e-Date.now(),o=Math.abs(t),n=Math.round(o/6e4);if(n<1)return"now";let s=n<60?`${n} min`:`${Math.floor(n/60)}h ${String(n%60).padStart(2,"0")}m`;return t>0?`in ${s}`:`${s} ago`}var So={0:["CLEAR","Clear sky","clear",0],1:["MAINLY CLEAR","Mainly clear","clear",0],2:["PARTLY CLOUDED","Partly cloudy","cloud",.4],3:["OVERCAST","Overcast","cloud",1],45:["FOG","Fog","fog",.7],48:["RIME FOG","Depositing rime fog","fog",1],51:["LIGHT DRIZZLE","Light drizzle","rain",.2],53:["DRIZZLE","Moderate drizzle","rain",.35],55:["DENSE DRIZZLE","Dense drizzle","rain",.5],56:["FREEZING DRIZZLE","Light freezing drizzle","rain",.3],57:["FREEZING DRIZZLE+","Dense freezing drizzle","rain",.5],61:["LIGHT RAIN","Slight rain","rain",.35],63:["RAIN","Moderate rain","rain",.6],65:["HEAVY RAIN","Heavy rain","rain",1],66:["FREEZING RAIN","Light freezing rain","rain",.5],67:["FREEZING RAIN+","Heavy freezing rain","rain",.9],71:["LIGHT SNOW","Slight snow fall","snow",.3],73:["SNOW","Moderate snow fall","snow",.6],75:["HEAVY SNOW","Heavy snow fall","snow",1],77:["SNOW GRAINS","Snow grains","snow",.3],80:["RAIN SHOWERS","Slight rain showers","rain",.45],81:["RAIN SHOWERS","Moderate rain showers","rain",.7],82:["VIOLENT SHOWERS","Violent rain showers","rain",1],85:["SNOW SHOWERS","Slight snow showers","snow",.5],86:["HEAVY SNOW SHOWERS","Heavy snow showers","snow",1],95:["THUNDERSTORM","Thunderstorm","storm",.7],96:["T-STORM + HAIL","Thunderstorm with slight hail","storm",.85],99:["SEVERE T-STORM","Thunderstorm with heavy hail","storm",1]};function Qe(e){let t=So[e]||So[0];return{code:e,label:t[0],long:t[1],kind:t[2],intensity:t[3]}}function eo(e,t=!0){let o=Qe(e).kind;return o==="clear"?e===0?t?"\u2600":"\u263E":t?"\u26C5":"\u2601":o==="cloud"?e===3?"\u2601":t?"\u26C5":"\u2601":o==="fog"?"\u2591":o==="rain"?"\u2614":o==="snow"?"\u2744":o==="storm"?"\u26A1":"\u25CB"}function ze(e){return e==null?{name:"NO DATA",color:"#8d9aab",level:0}:e<=50?{name:"GOOD",color:"#8fdc6a",level:1}:e<=100?{name:"MODERATE",color:"#ecd46a",level:2}:e<=150?{name:"SENSITIVE GROUPS",color:"#f59a5b",level:3}:e<=200?{name:"UNHEALTHY",color:"#f47171",level:4}:e<=300?{name:"VERY UNHEALTHY",color:"#c89af5",level:5}:{name:"HAZARDOUS",color:"#ef5a6a",level:6}}function Ge(e){return e==null?{name:"NO DATA",color:"#8d9aab"}:e<3?{name:"LOW",color:"#8fdc6a"}:e<6?{name:"MODERATE",color:"#ecd46a"}:e<8?{name:"HIGH",color:"#f59a5b"}:e<11?{name:"VERY HIGH",color:"#f47171"}:{name:"EXTREME",color:"#c89af5"}}var $o=[null,200,250,300,450,600,1e3];function Et(e,t=3){if(!e||e<=.1)return null;let o=$o[t]??$o[3];return Math.round(o/(e*1.5))}function pt(e){return e==null?{name:"NO DATA",color:"#8d9aab"}:e<2.5?{name:"LOW",color:"#8fdc6a"}:e<4.9?{name:"LOW-MED",color:"#c6dc6e"}:e<7.3?{name:"MEDIUM",color:"#ecd46a"}:e<9.7?{name:"MED-HIGH",color:"#f59a5b"}:{name:"HIGH",color:"#f47171"}}function At(e){return e==null?{name:"NO DATA",color:"#8d9aab",lat:null}:e<3?{name:"QUIET",color:"#6bb3bd",lat:66}:e<4?{name:"UNSETTLED",color:"#3fd0d8",lat:63}:e<5?{name:"ACTIVE",color:"#8fdc6a",lat:60}:e<6?{name:"G1 STORM",color:"#ecd46a",lat:56}:e<7?{name:"G2 STORM",color:"#f59a5b",lat:53}:e<8?{name:"G3 STORM",color:"#f47171",lat:50}:e<9?{name:"G4 STORM",color:"#c89af5",lat:47}:{name:"G5 EXTREME",color:"#ef5a6a",lat:42}}function Lt(e){return e==null?{name:"--",effect:""}:e<1?{name:"CALM",effect:"smoke rises vertically"}:e<4?{name:"LIGHT AIR",effect:"smoke drifts"}:e<8?{name:"LIGHT BREEZE",effect:"leaves rustle"}:e<13?{name:"GENTLE BREEZE",effect:"flags extend"}:e<19?{name:"MODERATE",effect:"dust and paper lift"}:e<25?{name:"FRESH BREEZE",effect:"small trees sway"}:e<32?{name:"STRONG BREEZE",effect:"umbrellas fail"}:e<39?{name:"NEAR GALE",effect:"walking is work"}:e<47?{name:"GALE",effect:"twigs break off"}:e<55?{name:"STRONG GALE",effect:"shingles lift"}:e<64?{name:"STORM",effect:"trees uprooted"}:e<73?{name:"VIOLENT STORM",effect:"widespread damage"}:{name:"HURRICANE",effect:"devastation"}}function qe(e){return e==null?{name:"--",color:"#8d9aab",note:""}:e<30?{name:"VERY DRY",color:"#7fb2f0",note:"static, chapped lips"}:e<45?{name:"DRY",color:"#3fd0d8",note:"crisp and comfortable"}:e<55?{name:"COMFORTABLE",color:"#8fdc6a",note:"ideal"}:e<60?{name:"STICKY",color:"#c6dc6e",note:"noticeable humidity"}:e<65?{name:"HUMID",color:"#ecd46a",note:"uncomfortable"}:e<70?{name:"OPPRESSIVE",color:"#f59a5b",note:"sweat does not evaporate"}:e<75?{name:"MISERABLE",color:"#f47171",note:"dangerous for exertion"}:{name:"LETHAL",color:"#ef5a6a",note:"limit outdoor exposure"}}function gt(e="",t=""){let o=e.toLowerCase();return/tornado|hurricane|extreme|tsunami/.test(o)?"#ef5a6a":/warning/.test(o)?"#f47171":/watch/.test(o)?"#f59a5b":/advisory|statement/.test(o)?"#ecd46a":t==="Extreme"||t==="Severe"?"#f47171":"#3fd0d8"}function Ct(e){let t=h=>new Intl.DateTimeFormat("en-US",{timeZone:e,...h}),o=t({hour:"2-digit",minute:"2-digit",hour12:!1}),n=t({hour:"numeric",minute:"2-digit",hour12:!0}),s=t({hour:"numeric",hour12:!0}),l=t({weekday:"short"}),v=t({month:"short",day:"numeric"}),g=t({weekday:"long",month:"long",day:"numeric"}),b=t({hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),y=h=>{if(h==null)return null;let d=new Date(h);return Number.isNaN(+d)?null:d},i=h=>d=>{let m=y(d);return m?h.format(m):"--"},u=new Intl.DateTimeFormat("en-CA",{timeZone:e}),S=new Intl.DateTimeFormat("en-US",{timeZone:e,hour:"numeric",minute:"numeric",hour12:!1});return{hm:i(o),hm12:i(n),hour:i(s),weekday:i(l),monthDay:i(v),full:i(g),hms:i(b),isoDate:h=>{let d=y(h);return d?u.format(d):"--"},hourOfDay:h=>{let d=y(h);if(!d)return NaN;let m=S.formatToParts(d),a=c=>+m.find(f=>f.type===c)?.value;return a("hour")%24+a("minute")/60}}}function ko(e,t){let o=new Date(e);if(Number.isNaN(+o))return NaN;let n=new Intl.DateTimeFormat("en-CA",{timeZone:t}).format(o),[,s,l]=n.split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][s-1]+l-1}var To="atmos.v1";function oo(e,t){if(!e||typeof e!="object")return null;let o=e.latitude??e.lat,n=e.longitude??e.lon,s=l=>(typeof l=="number"||typeof l=="string"&&l.trim()!=="")&&Number.isFinite(+l);return!s(o)||!s(n)||Math.abs(+o)>90||Math.abs(+n)>180?null:{name:e.name,admin1:e.admin1||"",country:e.country_code||e.country||"",lat:+o,lon:+n,tz:e.timezone||e.tz||t,elevation:e.elevation??null}}function Eo(e){let t=oo(e);return t&&{name:t.name,admin1:t.admin1,country_code:t.country,latitude:t.lat,longitude:t.lon,timezone:t.tz}}var no=e=>typeof e=="string"&&e?`${e.includes("T")?e:`${e}T00:00:00`}Z`:"",Io=e=>t=>Date.parse(no(t))-e*1e3;function Dt(e,t,o){if(!e?.time?.length)return[];let n=Io(t),s=e.time.length,l=new Array(s);for(let v=0;v<s;v++){let g={t:n(e.time[v]),i:v};for(let[b,y]of Object.entries(o))g[b]=e[y]?.[v]??null;l[v]=g}return l}var Ao={temp:"temperature_2m",rh:"relative_humidity_2m",dew:"dew_point_2m",feels:"apparent_temperature",pop:"precipitation_probability",precip:"precipitation",rain:"rain",showers:"showers",snow:"snowfall",snowDepth:"snow_depth",code:"weather_code",pressure:"pressure_msl",surfPressure:"surface_pressure",cloud:"cloud_cover",cloudLow:"cloud_cover_low",cloudMid:"cloud_cover_mid",cloudHigh:"cloud_cover_high",vis:"visibility",vpd:"vapour_pressure_deficit",wind:"wind_speed_10m",windDir:"wind_direction_10m",gust:"wind_gusts_10m",uv:"uv_index",uvClear:"uv_index_clear_sky",isDay:"is_day",sunshine:"sunshine_duration",cape:"cape",li:"lifted_index",cin:"convective_inhibition",freezing:"freezing_level_height",blh:"boundary_layer_height",wetbulb:"wet_bulb_temperature_2m",soilT:"soil_temperature_0cm",soilM:"soil_moisture_0_to_1cm",et0:"et0_fao_evapotranspiration"},Un={code:"weather_code",tmax:"temperature_2m_max",tmin:"temperature_2m_min",feelsMax:"apparent_temperature_max",feelsMin:"apparent_temperature_min",sunriseS:"sunrise",sunsetS:"sunset",daylight:"daylight_duration",sunshine:"sunshine_duration",uvMax:"uv_index_max",precip:"precipitation_sum",rain:"rain_sum",showers:"showers_sum",snow:"snowfall_sum",precipHours:"precipitation_hours",pop:"precipitation_probability_max",windMax:"wind_speed_10m_max",gustMax:"wind_gusts_10m_max",windDir:"wind_direction_10m_dominant",radiation:"shortwave_radiation_sum",et0:"et0_fao_evapotranspiration"},Lo={precip:"precipitation",code:"weather_code",cape:"cape",vis:"visibility",gust:"wind_gusts_10m",isDay:"is_day"},Co={aqi:"us_aqi",pm10:"pm10",pm25:"pm2_5",co:"carbon_monoxide",no2:"nitrogen_dioxide",so2:"sulphur_dioxide",o3:"ozone",aod:"aerosol_optical_depth",dust:"dust",uv:"uv_index",alder:"alder_pollen",birch:"birch_pollen",grass:"grass_pollen",mugwort:"mugwort_pollen",olive:"olive_pollen",ragweed:"ragweed_pollen"},Gn=.3048;function Do(e,t,o){if(!t||!e?.length)return;let n=Object.entries(o).filter(([,s])=>t[s]==="ft").map(([s])=>s);if(n.length)for(let s of e)for(let l of n)s[l]!=null&&(s[l]*=Gn)}var qn=new Set(["code","isDay","i"]);function Vn(e,t,o){if(!e)return t?{...t}:null;if(!t)return{...e};let n={};for(let s in e){let l=e[s],v=t[s];if(qn.has(s)){n[s]=o<.5?l:v;continue}typeof l=="number"&&typeof v=="number"?n[s]=s==="windDir"?((l+(((v-l)%360+540)%360-180)*o)%360+360)%360:Tt(l,v,o):n[s]=l??v}return n}function to(e,t){if(!e?.length)return null;if(t<=e[0].t)return{...e[0]};if(t>=e.at(-1).t)return{...e.at(-1)};let o=e[1].t-e[0].t,n=(t-e[0].t)/o,s=H(Math.floor(n),0,e.length-2);return Vn(e[s],e[s+1],n-s)}var ao=class{constructor(){this.listeners=new Map,this.requestId=0,this.pendingLocation=null,this.pendingRemember=!0,this.loc=null,this.tz=Intl.DateTimeFormat().resolvedOptions().timeZone,this.fmt=Ct(this.tz),this.raw=null,this.hours=[],this.days=[],this.min15=[],this.air=[],this.airNow=null,this.alerts=[],this.space=null,this.climate=null,this.models=null,this.pollen=null,this.radar=null,this.observed=null,this.cursor=Date.now(),this.now=Date.now(),this.following=!0,this.playing=!1,this.playRate=1,this.view="deck",this.status="boot",this.lastFetch=0,this.favorites=[],this.settings={sound:!1,skinType:3,voice:!0},this.restore()}on(t,o){return this.listeners.has(t)||this.listeners.set(t,new Set),this.listeners.get(t).add(o),()=>this.listeners.get(t).delete(o)}emit(t,o){for(let n of this.listeners.get(t)||[])try{n(o)}catch(s){console.error(`[store:${t}]`,s)}}restore(){try{let t=JSON.parse(localStorage.getItem(To)||"{}");t.loc&&(this.loc=oo(t.loc,this.tz)),Array.isArray(t.favorites)&&(this.favorites=t.favorites.map(Eo).filter(Boolean)),t.settings&&Object.assign(this.settings,t.settings)}catch{}}save(){try{localStorage.setItem(To,JSON.stringify({loc:this.loc,favorites:this.favorites,settings:this.settings}))}catch{}}setStatus(t){this.status=t,this.emit("status",t)}async setLocation(t,{remember:o=!0}={}){let n=oo(t,this.tz);n&&(this.pendingLocation=n,this.pendingRemember=o,await this.refresh({full:!0}))}addFavorite(t){let o=s=>`${(+(s.lat??s.latitude)).toFixed(3)},${(+(s.lon??s.longitude)).toFixed(3)}`,n=Eo(t);n&&(this.favorites=this.favorites.filter(s=>o(s)!==o(n)),this.favorites.unshift(n),this.favorites=this.favorites.slice(0,12),this.save(),this.emit("favorites",this.favorites))}removeFavorite(t){this.favorites.splice(t,1),this.save(),this.emit("favorites",this.favorites)}async refresh({full:t=!1}={}){let o=this.pendingLocation||this.loc;if(!o)return;let{lat:n,lon:s}=o,l=this.pendingLocation,v=this.pendingRemember,g=++this.requestId,b=()=>g===this.requestId;t=t||!!l,this.setStatus("load");try{let i=await ce.bundle(n,s);if(!b())return;if(!i.forecast?.ok||!Array.isArray(i.forecast.data?.hourly?.time)||!i.forecast.data.hourly.time.length)throw new Error(`Forecast unavailable for ${o.name||"this location"}`);let u=i.forecast.data.timezone||o.tz,S=Ct(u),h={loc:{...o,tz:u},tz:u,fmt:S,following:this.following,cursor:this.cursor};this.ingest.call(h,i),(!this.loc||this.loc.lat!==n||this.loc.lon!==s)&&(this.climate=this.models=this.pollen=this.observed=this.radar=null),Object.assign(this,h),this.pendingLocation=null,l&&v&&this.save(),this.lastFetch=Date.now(),this.setStatus("ok"),l&&this.emit("loc",this.loc),this.emit("data",this)}catch(i){if(!b())return;console.error("[store] bundle failed",i),this.setStatus("err"),this.emit("error",i);return}let y=[ce.radar().then(i=>{b()&&(this.radar=i,this.emit("radar",i))}),ce.pollen(n,s).then(i=>{b()&&(this.pollen=i,this.emit("pollen",i))}),ce.observations(n,s).then(i=>{b()&&(this.observed=i,this.emit("observed",i))})];(t||!this.climate)&&y.push(ce.climate(n,s).then(i=>{b()&&(this.climate=i,this.emit("climate",i))})),(t||!this.models)&&y.push(ce.models(n,s).then(i=>{b()&&(this.models=this.reduceModels(i),this.emit("models",this.models))})),Promise.allSettled(y).then(()=>{b()&&this.emit("data",this)})}ingest(t){this.raw=t;let o=t.forecast?.ok?t.forecast.data:null;if(o){let s=o.utc_offset_seconds??0;this.utcOffset=s,this.elevation=o.elevation,o.timezone&&o.timezone!==this.tz&&(this.tz=o.timezone,this.fmt=Ct(this.tz),this.loc&&(this.loc.tz=o.timezone)),this.hours=Dt(o.hourly,s,Ao),this.min15=Dt(o.minutely_15,s,Lo),Do(this.hours,o.hourly_units,Ao),Do(this.min15,o.minutely_15_units,Lo),this.days=Dt(o.daily,s,Un).map(l=>({...l,sunrise:l.sunriseS?Date.parse(no(l.sunriseS))-s*1e3:null,sunset:l.sunsetS?Date.parse(no(l.sunsetS))-s*1e3:null}))}let n=t.air?.ok?t.air.data:null;if(this.air=[],this.airNow=null,n&&(this.air=Dt(n.hourly,n.utc_offset_seconds??0,Co),this.airNow=n.current?Object.fromEntries(Object.entries(Co).map(([s,l])=>[s,n.current[l]??null])):null),this.alerts=t.alerts?.ok&&Array.isArray(t.alerts.data?.features)?t.alerts.data.features.filter(s=>s&&typeof s=="object").map(s=>({...s.properties,geometry:s.geometry})):[],this.space=t.space?.ok?t.space.data:null,this.hours.length){let s=this.following?Date.now():this.cursor;this.cursor=H(s,this.hours[0].t,this.hours.at(-1).t)}}reduceModels(t){let o=t?.hourly;if(!o?.time?.length)return null;let n=t.utc_offset_seconds??0,s=Io(n),l=Object.keys(o).filter(g=>g.startsWith("temperature_2m_")).map(g=>g.replace("temperature_2m_","")),v=[];for(let g=0;g<o.time.length;g++){let b=l.map(u=>o[`temperature_2m_${u}`]?.[g]).filter(u=>u!=null),y=l.map(u=>o[`precipitation_${u}`]?.[g]).filter(u=>u!=null);if(!b.length)continue;let i=b.reduce((u,S)=>u+S,0)/b.length;v.push({t:s(o.time[g]),mean:i,min:Math.min(...b),max:Math.max(...b),spread:Math.max(...b)-Math.min(...b),temps:b,precipAgree:y.length?y.filter(u=>u>.004).length/y.length:null})}return{names:l,rows:v}}setCursor(t,{silent:o=!1}={}){if(!this.hours.length)return;let n=this.hours[0].t,s=this.hours.at(-1).t;this.cursor=H(t,n,s),o||this.emit("cursor",this.cursor)}scrubTo(t,o){this.following=!1,this.setCursor(t,o)}syncToNow(){if(!this.following||this.playing||this.view==="radar")return;let t=Date.now();Math.abs(t-this.cursor)<1e3||this.setCursor(t)}toNow(){this.playing=!1,this.following=!0,this.setCursor(Date.now()),this.emit("play",!1)}get atNow(){return Math.abs(this.cursor-Date.now())<9e4}get span(){return this.hours.length?{lo:this.hours[0].t,hi:this.hours.at(-1).t}:{lo:0,hi:0}}frame(t=this.cursor){let o=to(this.hours,t);if(!o)return null;let n={...o,t},s=to(this.min15,t);s&&Math.abs(s.t-t)<30*6e4&&s.precip!=null&&(n.precip=s.precip,n.code=s.code??n.code,s.cape!=null&&(n.cape=s.cape),s.vis!=null&&(n.vis=s.vis),s.gust!=null&&(n.gust=s.gust));let l=to(this.air,t);l&&(n.air=l),n.wx=Qe(Math.round(n.code??0)),n.day=this.dayFor(t);let{lat:v,lon:g}=this.loc||{lat:0,lon:0},b=new Date(t),y=xe(b,v,g),i=Ze(b,v,g),u=Je(b);return n.sun={alt:y.altitude,az:y.azimuth,altDeg:y.altitude*57.29578,compass:He(y.azimuth)},n.moon={alt:i.altitude,az:i.azimuth,altDeg:i.altitude*57.29578,compass:He(i.azimuth),phase:u.phase,fraction:u.fraction,distance:i.distance},n}dayFor(t){let o=this.fmt.isoDate(t);return this.days.find(n=>this.fmt.isoDate(n.t)===o)||null}sunTimesFor(t=this.cursor){let{lat:o,lon:n}=this.loc||{lat:0,lon:0};return $t(new Date(t),o,n,this.elevation||0)}moonTimesFor(t=this.cursor){let{lat:o,lon:n}=this.loc||{lat:0,lon:0};return Mo(new Date(t),o,n)}skyParams(t=this.cursor){let o=this.frame(t);if(!o)return null;let n=o.wx.kind,s=o.precip??0,l=H(s/.12,0,1),v=n==="rain"||n==="snow"||n==="storm"?H(Math.max(o.wx.intensity*.55,l),0,1):l*.6,g=this.currentKp()??2;return{sunAlt:o.sun.alt,sunAz:o.sun.az+Math.PI,moonAlt:o.moon.alt,moonAz:o.moon.az+Math.PI,moonPhase:o.moon.phase,moonFrac:o.moon.fraction,viewAz:this.viewBearing(o),cloudLow:H((o.cloudLow??0)/100,0,1),cloudMid:H((o.cloudMid??0)/100,0,1),cloudHigh:H((o.cloudHigh??0)/100,0,1),precip:v,snow:n==="snow"?1:0,storm:n==="storm"?.85:H((o.cape??0)/2500,0,.6),fog:n==="fog"?.85:H(1-(o.vis??2e4)/6e3,0,.6),wind:o.wind??5,windDir:((o.windDir??0)+180)*Math.PI/180,kp:g,lat:this.loc?.lat??0,haze:H(1-(o.vis??24e3)/24e3,0,.8),cityGlow:.55}}viewBearing(t){let o=(this.loc?.lat??0)>=0?Math.PI:0;return t.sun.altDeg>-8?t.sun.az+Math.PI:t.moon.altDeg>2?t.moon.az+Math.PI:o}currentKp(){let t=this.space?.kpNow;if(t?.ok&&Array.isArray(t.data)&&t.data.length){let o=t.data.at(-1),n=Number(o.estimated_kp??o.kp_index);if(Number.isFinite(n))return n}return null}kpForecast(){let t=this.space?.kpFc;if(!t?.ok||!Array.isArray(t.data)||!t.data.length)return[];let o=t.data;return(Array.isArray(o[0])?o.slice(1).map(s=>({time_tag:s[0],kp:s[1],observed:s[2]})):o).map(s=>({t:Date.parse(String(s.time_tag).replace(" ","T").replace(/Z?$/,"Z")),kp:Number(s.kp??s.kp_index??s.estimated_kp),observed:s.observed})).filter(s=>Number.isFinite(s.kp)&&Number.isFinite(s.t))}},r=new ao;var io=new Set,ae={tier:2,fps:60,onBattery:!1,batteryLevel:1,hidden:!1,reducedMotion:matchMedia("(prefers-reduced-motion: reduce)").matches,manual:null,onChange(e){return io.add(e),()=>io.delete(e)}},so=0,It=0,Po=0,lt=0,dt=0;function Oo(e){so++,It+=e;let t=performance.now();if(t-Po<1e3)return;Po=t,ae.fps=It>0?so/It:60,so=0,It=0,ae.fps<40?(lt++,dt=0):ae.fps>55?(dt++,lt=0):(lt=0,dt=0);let o=it();o!==ae.tier&&rt(o)}function jn(){return typeof matchMedia!="function"?!1:matchMedia("(pointer: coarse)").matches&&matchMedia("(max-width: 820px)").matches}function it(){if(ae.manual!=null)return ae.manual;if(ae.hidden)return 0;if(ae.reducedMotion)return 1;if(jn()){let t=1;return lt>=3&&(t=Math.max(0,ae.tier-1)),dt>=6&&ae.tier<2&&(t=ae.tier+1),Math.max(0,Math.min(2,t))}let e=ae.onBattery?2:3;return ae.onBattery&&ae.batteryLevel<.25&&(e=1),lt>=3&&(e=Math.max(0,ae.tier-1)),dt>=6&&e>ae.tier&&(e=ae.tier+1),Math.max(0,Math.min(3,e))}function rt(e){ae.tier=e,document.documentElement.dataset.q=String(e),lt=0,dt=0;for(let t of io)t(e)}function Ro(){document.addEventListener("visibilitychange",()=>{ae.hidden=document.hidden,rt(it())}),matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change",e=>{ae.reducedMotion=e.matches,rt(it())}),navigator.getBattery&&navigator.getBattery().then(e=>{let t=()=>{ae.onBattery=!e.charging,ae.batteryLevel=e.level,rt(it())};e.addEventListener("chargingchange",t),e.addEventListener("levelchange",t),t()}).catch(()=>{}),rt(it())}function ro(e){ae.manual=e,rt(it())}var Kn=`#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`,Yn=`#version 300 es
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
}`,No={sunAlt:.4,sunAz:3,moonAlt:-.4,moonAz:1,moonPhase:.25,moonFrac:.5,viewAz:Math.PI,cloudLow:.2,cloudMid:.1,cloudHigh:.1,precip:0,snow:0,storm:0,fog:0,wind:6,windDir:4,kp:2,lat:33.6,haze:.15,cityGlow:.5},xn=new Set(["snow","lat"]),Pt=class{constructor(t){this.canvas=t,this.gl=null,this.params={...No},this.target={...No},this.quality=2,this.running=!1,this.flash=0,this.nextBolt=1/0,this.scale=1,this.ok=!1,this.t0=performance.now()}init(){let t=this.canvas.getContext("webgl2",{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:"high-performance",preserveDrawingBuffer:!1});if(!t)return this.ok=!1,!1;this.gl=t;let o=Zn(t,Kn,Yn);if(!o)return this.ok=!1,!1;this.prog=o,t.useProgram(o);let n=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,n),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let s=t.getAttribLocation(o,"aPos");t.enableVertexAttribArray(s),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0),this.u={};for(let l of["uRes","uTime","uQuality","uSunAlt","uSunAz","uMoonAlt","uMoonAz","uMoonPhase","uMoonFrac","uViewAz","uCloudLow","uCloudMid","uCloudHigh","uPrecip","uSnow","uStorm","uFlash","uFog","uWind","uWindDir","uKp","uLat","uHaze","uCityGlow"])this.u[l]=t.getUniformLocation(o,l);return this.resize(),this.ok=!0,!0}set(t){Object.assign(this.target,t)}snap(t){Object.assign(this.target,t),Object.assign(this.params,t)}setQuality(t){this.quality=t,this.scale=t>=3?1:t===2?.85:t===1?.65:.5,this.resize()}resize(){let t=this.gl;if(!t)return;let o=Math.min(window.devicePixelRatio||1,this.quality>=3?2:1.5),n=Math.max(2,Math.floor(this.canvas.clientWidth*o*this.scale)),s=Math.max(2,Math.floor(this.canvas.clientHeight*o*this.scale));this.canvas.width===n&&this.canvas.height===s||(this.canvas.width=n,this.canvas.height=s,t.viewport(0,0,n,s))}render(t,o){if(!this.ok)return;let n=this.gl,s=this.params,l=this.target,v=1-Math.pow(.0016,o);for(let b in l){if(xn.has(b)){s[b]=l[b];continue}if(b.endsWith("Az")||b==="windDir"){let y=l[b]-s[b];y=((y+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI,s[b]+=y*v}else s[b]+=(l[b]-s[b])*v}s.storm>.12?(this.nextBolt===1/0&&(this.nextBolt=t+Math.random()*3e3),t>this.nextBolt&&(this.flash=.3+Math.random()*.45,this.nextBolt=t+900+Math.random()*9e3*(1.15-s.storm))):this.nextBolt=1/0,this.flash*=Math.pow(8e-5,o),this.flash<.002&&(this.flash=0);let g=this.u;n.uniform2f(g.uRes,this.canvas.width,this.canvas.height),n.uniform1f(g.uTime,(t-this.t0)/1e3),n.uniform1i(g.uQuality,this.quality),n.uniform1f(g.uSunAlt,s.sunAlt),n.uniform1f(g.uSunAz,s.sunAz),n.uniform1f(g.uMoonAlt,s.moonAlt),n.uniform1f(g.uMoonAz,s.moonAz),n.uniform1f(g.uMoonPhase,s.moonPhase),n.uniform1f(g.uMoonFrac,s.moonFrac),n.uniform1f(g.uViewAz,s.viewAz),n.uniform1f(g.uCloudLow,s.cloudLow),n.uniform1f(g.uCloudMid,s.cloudMid),n.uniform1f(g.uCloudHigh,s.cloudHigh),n.uniform1f(g.uPrecip,s.precip),n.uniform1f(g.uSnow,s.snow),n.uniform1f(g.uStorm,s.storm),n.uniform1f(g.uFlash,this.flash),n.uniform1f(g.uFog,s.fog),n.uniform1f(g.uWind,s.wind),n.uniform1f(g.uWindDir,s.windDir),n.uniform1f(g.uKp,s.kp),n.uniform1f(g.uLat,s.lat),n.uniform1f(g.uHaze,s.haze),n.uniform1f(g.uCityGlow,s.cityGlow),n.drawArrays(n.TRIANGLES,0,3)}};function Zn(e,t,o){let n=Ho(e,e.VERTEX_SHADER,t),s=Ho(e,e.FRAGMENT_SHADER,o);if(!n||!s)return null;let l=e.createProgram();return e.attachShader(l,n),e.attachShader(l,s),e.linkProgram(l),e.getProgramParameter(l,e.LINK_STATUS)?(e.deleteShader(n),e.deleteShader(s),l):(console.error("[sky] link failed:",e.getProgramInfoLog(l)),null)}function Ho(e,t,o){let n=e.createShader(t);if(e.shaderSource(n,o),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){let s=e.getShaderInfoLog(n);console.error(`[sky] ${t===e.VERTEX_SHADER?"vertex":"fragment"} compile failed:
${s}`);let l=/ERROR:\s*\d+:(\d+)/.exec(s||"");if(l){let v=o.split(`
`),g=+l[1];console.error(v.slice(Math.max(0,g-3),g+2).map((b,y)=>`${Math.max(1,g-2)+y}| ${b}`).join(`
`))}return null}return n}var K=["#3fd0d8","#f07aa6","#f2b45a","#b39dfa","#7fb2f0"],R={good:"#8fdc6a",warn:"#ecd46a",serious:"#f59a5b",crit:"#f47171"},ve="#dde2e8",pe="#b3bfcc",se="#8d9aab",lo="rgba(255,255,255,.055)",Jn="#0f1826",zo="#16212f",Qn="500 12px 'JetBrains Mono', ui-monospace, monospace",$e="500 11.5px 'JetBrains Mono', ui-monospace, monospace",ye="600 11.5px 'Chakra Petch', system-ui, sans-serif";function Ee(e){if(e==null)return pe;let t=[[-20,"#9d8ef5"],[10,"#6aa9f0"],[32,"#3fd0d8"],[50,"#5cd6bc"],[65,"#a2d86a"],[78,"#ecd46a"],[88,"#f59a5b"],[100,"#f47171"],[115,"#f07aa6"]];if(e<=t[0][0])return t[0][1];if(e>=t.at(-1)[0])return t.at(-1)[1];for(let o=0;o<t.length-1;o++){let[n,s]=t[o],[l,v]=t[o+1];if(e>=n&&e<=l)return _e(s,v,(e-n)/(l-n))}return pe}function _e(e,t,o){let n=[1,3,5].map(v=>parseInt(e.slice(v,v+2),16)),s=[1,3,5].map(v=>parseInt(t.slice(v,v+2),16));return`#${n.map((v,g)=>Math.round(Tt(v,s[g],H(o,0,1)))).map(v=>v.toString(16).padStart(2,"0")).join("")}`}function j(e,t){let o=[1,3,5].map(n=>parseInt(e.slice(n,n+2),16));return`rgba(${o[0]},${o[1]},${o[2]},${t})`}var Xe=new Set;function _o(){for(let e of Xe)e.hover=null,e.render();Xe.clear()}var Fo=10;function le(e,t,{onPick:o,inspect:n=!0}={}){let s=e.getContext("2d"),l={canvas:e,ctx:s,hover:null,data:null,draw:t,dirty:!0},v=()=>{let f=Math.min(window.devicePixelRatio||1,2),p=e.clientWidth,T=e.clientHeight;if(!p||!T)return;let M=Math.round(p*f),$=Math.round(T*f);(e.width!==M||e.height!==$)&&(e.width=M,e.height=$),s.setTransform(f,0,0,f,0,0),l.w=p,l.h=T,l.render()};l.render=()=>{if(!(!l.w||!l.h)){s.clearRect(0,0,l.w,l.h);try{t(s,l.w,l.h,l.hover,l.data)}catch(f){console.error("[chart]",f.stack||f)}}},l.update=f=>{l.data=f,l.render()};let g=new ResizeObserver(v);g.observe(e),n&&(e.style.touchAction="pan-y");let b=f=>{let p=e.getBoundingClientRect();return{x:f.clientX-p.left,y:f.clientY-p.top}},y=f=>!!f.pointerType&&f.pointerType!=="mouse",i=(f,p)=>{l.hover={x:f.x,y:f.y,coarse:p},l.render()},u=()=>{Xe.delete(l),l.hover=null,l.render()},S=null,h=f=>{if(!y(f)){i(b(f),!1);return}S&&(S.moved=Math.max(S.moved,Math.hypot(f.clientX-S.cx,f.clientY-S.cy)),n&&i(b(f),!0))},d=f=>{let p=b(f);if(S={x:p.x,y:p.y,cx:f.clientX,cy:f.clientY,moved:0,coarse:y(f)},!S.coarse||!n)return;let T=l.hover;S.dismiss=!!T&&!!T.coarse&&Math.abs(T.x-p.x)<14&&Math.abs(T.y-p.y)<14;for(let M of Xe)M!==l&&(M.hover=null,M.render());Xe.clear(),Xe.add(l),i(p,!0)},m=f=>{let p=S;S=null,p&&(p.coarse&&n&&p.dismiss&&p.moved<Fo&&u(),o&&p.moved<Fo&&o({x:p.x,y:p.y,w:l.w,h:l.h},f))},a=()=>{S&&S.coarse&&n&&u(),S=null},c=f=>{y(f)||(l.hover=null,l.render())};return e.addEventListener("pointermove",h),e.addEventListener("pointerdown",d),e.addEventListener("pointerup",m),e.addEventListener("pointercancel",a),e.addEventListener("pointerleave",c),o&&(e.style.cursor="crosshair"),l.destroy=()=>{g.disconnect(),Xe.delete(l),e.removeEventListener("pointermove",h),e.removeEventListener("pointerdown",d),e.removeEventListener("pointerup",m),e.removeEventListener("pointercancel",a),e.removeEventListener("pointerleave",c)},v(),l}function ke(e,t,o,{width:n=2,glow:s=12,closed:l=!1}={}){if(t.length<2)return;let v=()=>{e.beginPath(),e.moveTo(t[0][0],t[0][1]);for(let g=1;g<t.length;g++)e.lineTo(t[g][0],t[g][1]);l&&e.closePath()};e.lineJoin="round",e.lineCap="round",s&&(e.save(),e.shadowColor=o,e.shadowBlur=s/2,e.strokeStyle=j(o,.55),e.lineWidth=n,v(),e.stroke(),e.restore()),e.strokeStyle=o,e.lineWidth=n,v(),e.stroke()}function Pe(e,t){if(!(t.length<2)){e.moveTo(t[0][0],t[0][1]);for(let o=0;o<t.length-1;o++){let n=t[Math.max(0,o-1)],s=t[o],l=t[o+1],v=t[Math.min(t.length-1,o+2)];e.bezierCurveTo(s[0]+(l[0]-n[0])/6,s[1]+(l[1]-n[1])/6,l[0]-(v[0]-s[0])/6,l[1]-(v[1]-s[1])/6,l[0],l[1])}}}function Ce(e,t,o,n=String,{color:s=lo,label:l=!0}={}){e.save(),e.strokeStyle=s,e.lineWidth=1,e.font=$e,e.fillStyle=se,e.textAlign="right",e.textBaseline="middle";let v=-1e9;for(let{v:g,y:b}of o){if(e.beginPath(),e.moveTo(t.x,Math.round(b)+.5),e.lineTo(t.x+t.w,Math.round(b)+.5),e.stroke(),!l)continue;let y=b-t.y<9?b+6:b-5;Math.abs(y-v)<14||(Ae(e,n(g),t.x+t.w-2,y),v=y)}e.restore()}function Ve(e,t,o,n,s,l,v=3){let g=Math.abs(s-o);if(g<.4)return;let b=Math.min(v,n/2,g);e.beginPath(),e.moveTo(t,s),e.lineTo(t,o+b),e.quadraticCurveTo(t,o,t+b,o),e.lineTo(t+n-b,o),e.quadraticCurveTo(t+n,o,t+n,o+b),e.lineTo(t+n,s),e.closePath(),e.fillStyle=l,e.save(),e.globalAlpha*=.6,e.fill(),e.clip(),e.globalAlpha/=.6,e.fillRect(t,o,n,Math.min(2.5,g)),e.restore()}function Ae(e,t,o,n,s=3){e.save(),e.lineWidth=s,e.lineJoin="round",e.strokeStyle=j(zo,.9),e.strokeText(t,o,n),e.restore(),e.fillText(t,o,n)}function Me(e,t,o,n,s=se,l="left"){e.save(),e.font=ye,e.fillStyle=s,e.textAlign=l,e.textBaseline="top",e.letterSpacing="1.4px",Ae(e,n.toUpperCase(),t,o),e.restore()}function et(e,t,o,n,s,l,v="#3fd0d8",{pin:g=!1}={}){e.save(),e.font=Qn;let i=Math.max(...n.map(m=>e.measureText(m.replace(/\|/g,"  ")).width))+14,u=n.length*13+14-2,S,h;g?(S=t>s/2?4:Math.max(4,s-i-4),h=o<l/2?Math.max(4,l-u-4):4):(S=t+12,h=H(o-u-10,4,l-u-4),S+i>s-4&&(S=t-i-12),S=H(S,4,Math.max(4,s-i-4))),e.fillStyle=j(zo,.94),e.strokeStyle=j(v,.5),e.lineWidth=1;let d=5;e.beginPath(),e.moveTo(S,h+d),e.lineTo(S+d,h),e.lineTo(S+i,h),e.lineTo(S+i,h+u-d),e.lineTo(S+i-d,h+u),e.lineTo(S,h+u),e.closePath(),e.fill(),e.stroke(),e.textBaseline="top",n.forEach((m,a)=>{let[c,f]=m.split("|");e.textAlign="left",e.fillStyle=a===0?v:pe,e.fillText(c,S+7,h+7+a*13),f!=null&&(e.textAlign="right",e.fillStyle=a===0?v:ve,e.fillText(f,S+i-7,h+7+a*13))}),e.restore()}function Xn(e,t,o,n,{align:s="left"}={}){e.save(),e.font=ye,e.textBaseline="middle",e.letterSpacing="1.2px";let l=0,v=n.map(b=>{let y=e.measureText(b.label.toUpperCase()).width+16;return l+=y,y}),g=s==="right"?t-l:t;n.forEach((b,y)=>{e.fillStyle=b.color,b.dash?(e.strokeStyle=b.color,e.lineWidth=2,e.setLineDash([3,2]),e.beginPath(),e.moveTo(g,o),e.lineTo(g+9,o),e.stroke(),e.setLineDash([])):e.fillRect(g,o-3,9,3),e.fillStyle=pe,e.textAlign="left",e.fillText(b.label.toUpperCase(),g+13,o),g+=v[y]}),e.restore()}function Bo(e,t,o,n,s){e.save(),e.fillStyle="rgba(8,13,22,.32)";for(let l of o){if(!l.sunset||!l.sunrise)continue;let v=o[o.indexOf(l)+1],g=n(l.sunset),b=v?.sunrise?n(v.sunrise):t.x+t.w,y=H(g,t.x,t.x+t.w),i=H(b,t.x,t.x+t.w);i>y&&e.fillRect(y,t.y,i-y,t.h)}e.restore()}function Ot(e,t,o,n,s,{dash:l=null,flagTop:v=!0}={}){if(e.save(),e.strokeStyle=n,e.lineWidth=1,l&&e.setLineDash(l),e.shadowColor=n,e.shadowBlur=4,e.beginPath(),e.moveTo(Math.round(t)+.5,o.y),e.lineTo(Math.round(t)+.5,o.y+o.h),e.stroke(),e.restore(),s){e.save(),e.font=ye,e.letterSpacing="1.2px";let g=e.measureText(s).width+8,b=H(t-g/2,o.x,o.x+o.w-g),y=v?o.y:o.y+o.h-11;e.fillStyle=n,e.fillRect(b,y,g,11),e.fillStyle=Jn,e.textAlign="center",e.textBaseline="middle",e.fillText(s,b+g/2,y+6),e.restore()}}function Be(e,t=4){return H(Math.floor(e/26),1,t)}function Rt(e,t,o,{gap:n=8,least:s=1}={}){if(e<2||t<=0)return s;let l=t/(e-1);return Math.max(s,Math.ceil((o+n)/Math.max(l,.5)))}function Oe(e,t,o,n,s,l){let v=e.measureText(t).width;return v>l-s?!1:(e.fillText(t,H(o,s+v/2,l-v/2),n),!0)}function vt(e,t,o,n,s=[],{short:l=null}={}){let v=(u,S)=>{e.save(),e.font=ye,e.letterSpacing=u;let h=e.measureText(String(S).toUpperCase()).width;return e.restore(),h},g=(u,S)=>v("1.4px",u)+S.reduce((h,d)=>h+v("1.2px",d.label)+16,0)+14,b=s.map(u=>u.short?{...u,label:u.short}:u),[y,i]=[[n,s],[n,b],[l??n,b],[l??n,[]]].find(([u,S])=>g(u,S)<=t.w)??[l??n,[]];Me(e,t.x+2,o,y),i.length&&Xn(e,t.x+t.w,o+5,i,{align:"right"})}function We(e,t,o=4){if(!Number.isFinite(e)||!Number.isFinite(t)||e===t)return[e||0];let s=(t-e)/o,l=Math.pow(10,Math.floor(Math.log10(s))),v=s/l,g=(v<1.5?1:v<3?2:v<7?5:10)*l,b=[];for(let y=Math.ceil(e/g)*g;y<=t+1e-9;y+=g)b.push(+y.toFixed(6));return b}function je(e,t,o,n,{value:s,min:l=0,max:v=100,color:g=K[0],label:b="",unit:y="",bands:i=null,sub:u="",decimals:S=0,ticks:h=5}){let d=Math.PI*.75,m=Math.PI*2.25,a=s==null?0:H((s-l)/(v-l),0,1),c=d+(m-d)*a;if(e.save(),e.lineCap="butt",e.beginPath(),e.arc(t,o,n,d,m),e.strokeStyle="rgba(255,255,255,.07)",e.lineWidth=6,e.stroke(),i)for(let M of i){let $=H((M.from-l)/(v-l),0,1),k=H((M.to-l)/(v-l),0,1);k<=$||(e.beginPath(),e.arc(t,o,n+6,d+(m-d)*$,d+(m-d)*k),e.strokeStyle=j(M.color,.55),e.lineWidth=2.5,e.stroke())}e.strokeStyle="rgba(255,255,255,.14)",e.lineWidth=1;for(let M=0;M<=h;M++){let $=d+(m-d)*(M/h),k=Math.cos($),A=Math.sin($);e.beginPath(),e.moveTo(t+k*(n-5),o+A*(n-5)),e.lineTo(t+k*(n-10),o+A*(n-10)),e.stroke()}if(s!=null&&a>.001){e.save(),e.shadowColor=g,e.shadowBlur=7,e.beginPath(),e.arc(t,o,n,d,c),e.strokeStyle=g,e.lineWidth=6,e.stroke(),e.restore();let M=Math.cos(c),$=Math.sin(c);e.beginPath(),e.arc(t+M*n,o+$*n,3.2,0,Math.PI*2),e.fillStyle=ve,e.shadowColor=g,e.shadowBlur=5,e.fill(),e.shadowBlur=0}e.textAlign="center",e.textBaseline="alphabetic",e.fillStyle=ve,e.font=`700 ${Math.round(n*.62)}px 'JetBrains Mono', monospace`;let f=s==null?"--":s.toFixed(S),p=o+n*.18,T=e.measureText(f).actualBoundingBoxDescent;if(e.fillText(f,t,p),y){e.font=$e,e.fillStyle=pe;let M=e.measureText(y).actualBoundingBoxAscent;e.fillText(y,t,Math.max(o+n*.46,p+T+M+3))}b&&(e.font=ye,e.fillStyle=se,e.letterSpacing="1.4px",e.fillText(b.toUpperCase(),t,o+n+15)),u&&(e.font=ye,e.fillStyle=g,e.letterSpacing="1.2px",Ae(e,u.toUpperCase(),t,o-n*.42)),e.restore()}function Wo(e,t,o,{color:n=K[0],fill:s=!0,width:l=1.8,min:v=null,max:g=null,glow:b=8}){let y=o.filter(d=>d!=null);if(y.length<2)return;let i=v??Math.min(...y),S=(g??Math.max(...y))-i||1,h=o.map((d,m)=>[t.x+m/(o.length-1)*t.w,t.y+t.h-((d??i)-i)/S*t.h]);if(s){e.save(),e.beginPath(),Pe(e,h),e.lineTo(h.at(-1)[0],t.y+t.h),e.lineTo(h[0][0],t.y+t.h),e.closePath();let d=e.createLinearGradient(0,t.y,0,t.y+t.h);d.addColorStop(0,j(n,.34)),d.addColorStop(1,j(n,0)),e.fillStyle=d,e.fill(),e.restore()}return e.save(),b&&(e.shadowColor=n,e.shadowBlur=b/2),e.beginPath(),Pe(e,h),e.strokeStyle=n,e.lineWidth=l,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore(),h}function Uo(e,t,o,n,{dir:s,speed:l,gust:v,color:g=K[0]}){e.save(),e.strokeStyle="rgba(255,255,255,.09)",e.lineWidth=1,e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.stroke(),e.font=ye,e.fillStyle=se,e.textAlign="center",e.textBaseline="middle";for(let[u,S]of[["N",-90],["E",0],["S",90],["W",180]]){let h=S*Math.PI/180;e.fillText(u,t+Math.cos(h)*(n+8),o+Math.sin(h)*(n+8))}for(let u=0;u<16;u++){let S=(u*22.5-90)*Math.PI/180,h=u%4===0;e.strokeStyle=h?"rgba(255,255,255,.20)":"rgba(255,255,255,.09)",e.beginPath(),e.moveTo(t+Math.cos(S)*n,o+Math.sin(S)*n),e.lineTo(t+Math.cos(S)*(n-(h?7:4)),o+Math.sin(S)*(n-(h?7:4))),e.stroke()}if(s!=null){let u=(s-90+180)*Math.PI/180,S=n-10;e.save(),e.translate(t,o),e.rotate(u),e.shadowColor=g,e.shadowBlur=6,e.fillStyle=g,e.beginPath(),e.moveTo(S,0),e.lineTo(S-9,-5.5),e.lineTo(S-6,0),e.lineTo(S-9,5.5),e.closePath(),e.fill(),e.strokeStyle=g,e.lineWidth=2,e.beginPath(),e.moveTo(-S*.55,0),e.lineTo(S-7,0),e.stroke(),e.restore()}e.textAlign="center",e.textBaseline="alphabetic",e.fillStyle=ve,e.font=`700 ${Math.round(n*.44)}px 'JetBrains Mono', monospace`;let b=l==null?"--":String(Math.round(l)),y=o+n*.06,i=e.measureText(b).actualBoundingBoxDescent;e.fillText(b,t,y),e.font=$e,e.fillStyle=pe,e.fillText("mph",t,Math.max(o+n*.3,y+i+e.measureText("mph").actualBoundingBoxAscent+3)),v!=null&&v>(l??0)+1&&(e.font=$e,e.fillStyle=R.serious,e.fillText(`G${Math.round(v)}`,t,o-n*.26)),e.restore()}function Nt(e,t,o,n,s,l){e.save(),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.fillStyle="#16212f",e.fill(),e.strokeStyle="rgba(127,178,240,.22)",e.lineWidth=1,e.stroke();let v=1-2*H(l,0,1),g=s<.5;e.save(),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.clip(),e.beginPath();let b=48;for(let i=0;i<=b;i++){let u=-1+2*i/b,S=v*Math.sqrt(Math.max(0,1-u*u)),h=t+(g?S:-S)*n;i===0?e.moveTo(h,o+u*n):e.lineTo(h,o+u*n)}for(let i=b;i>=0;i--){let u=-1+2*i/b;e.lineTo(t+(g?1:-1)*Math.sqrt(Math.max(0,1-u*u))*n,o+u*n)}e.closePath();let y=e.createRadialGradient(t-n*.25,o-n*.25,n*.1,t,o,n);y.addColorStop(0,"#f2f6ff"),y.addColorStop(1,"#b9c6da"),e.fillStyle=y,e.shadowColor="rgba(200,225,255,.7)",e.shadowBlur=n*.5,e.fill(),e.shadowBlur=0,e.globalCompositeOperation="multiply",e.fillStyle="rgba(150,165,190,.55)";for(let[i,u,S]of[[-.28,-.2,.26],[.1,-.34,.18],[.22,.1,.22],[-.15,.3,.16],[-.42,.12,.13]])e.beginPath(),e.arc(t+i*n,o+u*n,S*n,0,Math.PI*2),e.fill();e.restore(),e.restore()}function Go(e,t,o,n,{sunTrack:s=[],moonTrack:l=[],sun:v=null,moon:g=null,iss:b=null,night:y=0}){let i=(d,m)=>{let a=(1-H(m,0,90)/90)*n,c=(d-90)*Math.PI/180;return[t+Math.cos(c)*a,o+Math.sin(c)*a]};e.save();let u=e.createRadialGradient(t,o,0,t,o,n);u.addColorStop(0,y>.5?"rgba(6,12,30,.85)":"rgba(10,40,72,.55)"),u.addColorStop(1,y>.5?"rgba(2,4,12,.6)":"rgba(6,20,40,.4)"),e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.fillStyle=u,e.fill(),e.strokeStyle="rgba(255,255,255,.10)",e.lineWidth=1;for(let d of[30,60])e.beginPath(),e.arc(t,o,(1-d/90)*n,0,Math.PI*2),e.stroke();e.strokeStyle="rgba(63,208,216,.28)",e.beginPath(),e.arc(t,o,n,0,Math.PI*2),e.stroke(),e.font=ye,e.textAlign="center",e.textBaseline="middle";for(let[d,m]of[["N",0],["E",90],["S",180],["W",270]]){let[a,c]=i(m,0);e.strokeStyle="rgba(255,255,255,.07)",e.beginPath(),e.moveTo(t,o),e.lineTo(a,c),e.stroke();let[f,p]=i(m,-9);e.fillStyle=se,e.fillText(d,f,p)}let S=(d,m,a)=>{let c=[],f=()=>{c.length>1&&(e.save(),a&&e.setLineDash(a),ke(e,c,m,{width:1.5,glow:6}),e.restore()),c=[]};for(let p of d){if(p.alt<0){f();continue}c.push(i(p.az,p.alt))}f()};S(s,"#f2b45a",null),S(l,"#7fb2f0",[3,3]);let h=(d,m,a)=>{if(!d||d.alt<-2)return;let[c,f]=i(d.az,Math.max(0,d.alt));e.save(),e.shadowColor=m,e.shadowBlur=8,e.fillStyle=m,e.beginPath(),e.arc(c,f,a,0,Math.PI*2),e.fill(),e.restore(),d.alt<0&&(e.strokeStyle=j(m,.5),e.setLineDash([2,2]),e.beginPath(),e.arc(c,f,a+3,0,Math.PI*2),e.stroke(),e.setLineDash([]))};if(h(g,"#c9d8f5",5),h(v,"#efc865",6.5),b){let[d,m]=i(b.az,Math.max(0,b.alt));e.save(),e.strokeStyle="#8fdc6a",e.lineWidth=1.5,e.shadowColor="#8fdc6a",e.shadowBlur=5,e.beginPath(),e.arc(d,m,4,0,Math.PI*2),e.stroke(),e.beginPath(),e.moveTo(d-7,m),e.lineTo(d+7,m),e.stroke(),e.restore()}e.restore()}var tt=8,qo=8,Vo=16,jo=15;function Ko(e){e.innerHTML=`
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
  `;let t=e.querySelector(".tl-canvas"),o=e.querySelector(".tl-when b"),n=e.querySelector(".tl-when span"),s=e.querySelector(".tl-delta"),l=e.querySelector(".tl-play"),v=!1,g=le(t,y,{inspect:!1});function b(d){let{lo:m,hi:a}=r.span,c=d-tt-qo;return{lo:m,hi:a,plotW:c,xOf:f=>tt+(f-m)/(a-m||1)*c,tOf:f=>m+(f-tt)/c*(a-m||1)}}function y(d,m,a,c){let f=r.hours;if(!f?.length)return;let p=b(m),T=r.fmt,M={x:tt,y:Vo,w:p.plotW,h:a-Vo-jo};d.save(),d.fillStyle="rgba(8,13,22,.4)";for(let B=0;B<r.days.length;B++){let q=r.days[B],ne=r.days[B+1];if(!q.sunset)continue;let J=H(p.xOf(q.sunset),M.x,M.x+M.w),x=H(ne?.sunrise?p.xOf(ne.sunrise):M.x+M.w,M.x,M.x+M.w);x>J&&d.fillRect(J,M.y,x-J,M.h)}d.restore();let $=f.map(B=>B.temp).filter(B=>B!=null),k=Math.min(...$),A=Math.max(...$),L=B=>M.y+M.h*.92-(B-k)/(A-k||1)*M.h*.72,C=f.filter(B=>B.temp!=null).map(B=>[p.xOf(B.t),L(B.temp)]);d.save(),d.beginPath(),Pe(d,C),d.lineTo(C.at(-1)[0],M.y+M.h),d.lineTo(C[0][0],M.y+M.h),d.closePath();let D=d.createLinearGradient(0,M.y,0,M.y+M.h);D.addColorStop(0,j(Ee(A),.34)),D.addColorStop(1,j(Ee(k),.03)),d.fillStyle=D,d.fill(),d.restore();let N=d.createLinearGradient(tt,0,tt+p.plotW,0);for(let B=0;B<=12;B++){let q=f[Math.round(B/12*(f.length-1))];N.addColorStop(B/12,Ee(q?.temp))}d.save(),d.shadowColor=j(K[0],.8),d.shadowBlur=4,d.beginPath(),Pe(d,C),d.strokeStyle=N,d.lineWidth=1.8,d.lineJoin="round",d.stroke(),d.restore();let E=Math.max(...f.map(B=>B.precip??0),.02);d.save();for(let B of f){let q=B.precip??0;if(q<.001)continue;let ne=p.xOf(B.t),J=H(q/E,.08,1)*M.h*.3;d.fillStyle=j(K[4],.75),d.fillRect(ne-.7,M.y+M.h-J,1.6,J)}d.restore(),d.save(),d.font=ye,d.letterSpacing="1.2px",d.textBaseline="top";let P=r.days.length>1?Math.abs(p.xOf(r.days[1].t)-p.xOf(r.days[0].t)):M.w,F=34,G=Math.max(1,Math.ceil(F/Math.max(1,P))),W=0;for(let B of r.days){let q=p.xOf(B.t),ne=W++%G===0;q<M.x||q>M.x+M.w||(d.strokeStyle=ne?"rgba(255,255,255,.10)":"rgba(255,255,255,.05)",d.lineWidth=1,d.beginPath(),d.moveTo(Math.round(q)+.5,M.y),d.lineTo(Math.round(q)+.5,M.y+M.h),d.stroke(),!(!ne||q+F>M.x+M.w)&&(d.fillStyle=se,d.textAlign="left",d.fillText(T.weekday(B.t).toUpperCase(),q+3,a-jo+3)))}d.restore();for(let B of r.alerts){let q=Date.parse(B.effective||B.onset||0),ne=Date.parse(B.expires||B.ends||0);if(!q||!ne)continue;let J=H(p.xOf(q),M.x,M.x+M.w),x=H(p.xOf(ne),M.x,M.x+M.w);x<=J||(d.fillStyle=j(R.crit,.55),d.fillRect(J,M.y-4,x-J,3))}let O=Date.now(),U=p.xOf(O);if(U>=M.x&&U<=M.x+M.w&&(d.save(),d.strokeStyle=j(R.good,.85),d.lineWidth=1,d.setLineDash([2,3]),d.shadowColor=R.good,d.shadowBlur=4,d.beginPath(),d.moveTo(Math.round(U)+.5,M.y-4),d.lineTo(Math.round(U)+.5,M.y+M.h),d.stroke(),d.restore()),c&&!v&&c.x>M.x&&c.x<M.x+M.w){let B=p.tOf(c.x);d.save(),d.strokeStyle="rgba(255,255,255,.22)",d.lineWidth=1,d.beginPath(),d.moveTo(Math.round(c.x)+.5,M.y),d.lineTo(Math.round(c.x)+.5,M.y+M.h),d.stroke(),d.font=$e,d.fillStyle=pe,d.textAlign=c.x>m-70?"right":"left",d.textBaseline="top",d.fillText(`${T.weekday(B)} ${T.hm(B)}`,c.x+(c.x>m-70?-5:5),2),d.restore()}let ee=p.xOf(r.cursor);d.save(),d.strokeStyle=K[1],d.lineWidth=1.5,d.shadowColor=K[1],d.shadowBlur=7,d.beginPath(),d.moveTo(Math.round(ee)+.5,M.y-6),d.lineTo(Math.round(ee)+.5,M.y+M.h+3),d.stroke(),d.fillStyle=K[1],d.beginPath(),d.moveTo(ee,M.y-10),d.lineTo(ee+5,M.y-16),d.lineTo(ee-5,M.y-16),d.closePath(),d.fill(),d.restore()}let i=d=>{let m=t.getBoundingClientRect(),a=b(m.width);r.playing=!1,S(),r.scrubTo(a.tOf(H(d-m.left,tt,m.width-qo)))};t.addEventListener("pointerdown",d=>{v=!0,t.setPointerCapture(d.pointerId),i(d.clientX)}),t.addEventListener("pointermove",d=>{v&&i(d.clientX)});let u=d=>{if(v){v=!1;try{t.releasePointerCapture(d.pointerId)}catch{}}};t.addEventListener("pointerup",u),t.addEventListener("pointercancel",u),t.style.cursor="ew-resize",e.addEventListener("click",d=>{let m=d.target.closest("button");if(!m)return;if(m.dataset.rate){r.playRate=+m.dataset.rate,e.querySelectorAll("[data-rate]").forEach(c=>c.classList.toggle("on",+c.dataset.rate===r.playRate));return}let a=m.dataset.act;a==="now"?r.toNow():a==="back"?(r.playing=!1,r.scrubTo(r.cursor-36e5)):a==="fwd"?(r.playing=!1,r.scrubTo(r.cursor+36e5)):a==="play"&&(r.playing=!r.playing,r.playing&&r.view!=="radar"&&(r.following=!1),r.playing&&r.cursor>=r.span.hi-6e4&&r.setCursor(Date.now()),r.emit("play",r.playing)),S()});function S(){l.textContent=r.playing?"\u275A\u275A":"\u25B6",l.classList.toggle("on",r.playing),e.querySelector(".tl-now").classList.toggle("on",r.atNow)}function h(){let d=r.fmt,m=r.cursor;o.textContent=d.hm12(m),n.textContent=`${d.weekday(m)} ${d.monthDay(m)}`;let a=m-Date.now(),c=Math.round(Math.abs(a)/6e4);if(c<3)s.textContent="NOW",s.className="tl-delta now";else{let f=Math.floor(c/60),p=c%60,T=f>=24?`${Math.floor(f/24)}d ${f%24}h`:f?`${f}h ${p}m`:`${p}m`;s.textContent=a>0?`+${T}`:`\u2212${T}`,s.className="tl-delta "+(a>0?"fwd":"back")}S()}return r.on("cursor",()=>{h(),g.render()}),r.on("data",()=>{h(),g.render()}),r.on("play",S),e.querySelector('[data-rate="1"]').classList.add("on"),h(),{render:()=>g.render(),tick(d){if(!r.playing||r.view==="radar")return;let m=r.cursor+d*1e3*3600*r.playRate;m>=r.span.hi?(r.setCursor(r.span.hi),r.playing=!1,r.emit("play",!1),S()):r.setCursor(m)}}}function Ht(e,t,o,n,s){let{hours:l,days:v,span:g,cursor:b,now:y,tf:i,panels:u=["temp","pop"],showAxis:S=!0}=s;if(!l?.length)return;let h=4,d=30,m=14,a=S?30:4,c=t-h-d;if(c<30)return;let f=l.filter(E=>E.t>=g.lo-36e5&&E.t<=g.hi+36e5);if(f.length<2)return;let p=E=>h+(E-g.lo)/(g.hi-g.lo)*c,T=E=>g.lo+(E-h)/c*(g.hi-g.lo),M={temp:1,pop:.42,wind:.42,cloud:.3,pressure:.42,uv:.36,cape:.36},$=u.reduce((E,P)=>E+(M[P]||.4),0),k=u.length>2?16:9,A=o-m-a-(u.length-1)*k,L=m,C={};for(let E of u){let P=A*(M[E]||.4)/$;C[E]={x:h,y:L,w:c,h:P},L+=P+k}let D={x:h,y:m,w:c,h:o-m-a};if(Bo(e,D,v||[],p),v?.length){e.save(),e.strokeStyle="rgba(255,255,255,.07)",e.lineWidth=1,e.font=ye,e.letterSpacing="1.2px",e.textBaseline="top";for(let E of v){let P=p(E.t);P<h-1||P>h+c||(e.beginPath(),e.moveTo(Math.round(P)+.5,m),e.lineTo(Math.round(P)+.5,m+D.h),e.stroke(),S&&(e.fillStyle=se,e.textAlign="left",e.fillText(i.weekday(E.t).toUpperCase(),P+3,o-a+17)))}e.restore()}let N=[];if(C.temp){let E=C.temp,P=f.map(J=>J.temp).filter(J=>J!=null),F=f.map(J=>J.feels).filter(J=>J!=null),G=P.concat(F),W=Math.min(...G)-2,O=Math.max(...G)+2,U=J=>E.y+E.h-(J-W)/(O-W)*E.h;if(Ce(e,E,We(W,O,Be(E.h,3)).map(J=>({v:J,y:U(J)})),J=>`${Math.round(J)}\xB0`),F.length>1){e.save(),e.setLineDash([4,3]);let J=f.filter(x=>x.feels!=null).map(x=>[p(x.t),U(x.feels)]);ke(e,J,j(K[1],.75),{width:1.5,glow:6}),e.restore()}let ee=f.filter(J=>J.temp!=null).map(J=>[p(J.t),U(J.temp)]);e.save(),e.beginPath(),Pe(e,ee),e.lineTo(ee.at(-1)[0],E.y+E.h),e.lineTo(ee[0][0],E.y+E.h),e.closePath();let B=e.createLinearGradient(0,E.y,0,E.y+E.h);B.addColorStop(0,j(Ee(O),.3)),B.addColorStop(1,j(Ee(W),.02)),e.fillStyle=B,e.fill(),e.restore();let q=e.createLinearGradient(h,0,h+c,0);for(let J=0;J<=8;J++){let x=f[Math.round(J/8*(f.length-1))];q.addColorStop(J/8,Ee(x?.temp))}e.save(),e.shadowColor=j(K[0],.9),e.shadowBlur=6,e.beginPath(),Pe(e,ee),e.strokeStyle=q,e.lineWidth=2.2,e.lineJoin="round",e.lineCap="round",e.stroke(),e.restore(),e.save(),e.font=$e,e.textAlign="center",e.textBaseline="bottom";let ne=e.measureText("100\xB0").width+6;for(let J of v||[]){let x=f.filter(de=>i.isoDate(de.t)===i.isoDate(J.t)&&de.temp!=null);if(x.length<3)continue;let ue=x.reduce((de,w)=>w.temp>de.temp?w:de),Re=x.reduce((de,w)=>w.temp<de.temp?w:de);for(let[de,w,I]of[[ue,-6,"bottom"],[Re,13,"top"]]){let V=p(de.t),z=e.measureText(`${Math.round(de.temp)}\xB0`).width;if(V-z/2<h+4||V+z/2>h+c-ne)continue;let _=U(de.temp)+w,Y=I==="top"?_+9>E.y+E.h:_-9<E.y;e.textBaseline=Y?I==="top"?"bottom":"top":I,e.fillStyle=Ee(de.temp),Ae(e,`${Math.round(de.temp)}\xB0`,V,Y?U(de.temp)-w:_)}}e.restore(),vt(e,E,E.y-11,"temperature \xB0F",[{label:"actual",color:K[0]},{label:"feels like",short:"feels",color:K[1],dash:!0}],{short:"temp \xB0F"}),N.push({key:"temp",box:E,yOf:U})}if(C.pop){let E=C.pop,P=U=>E.y+E.h-H(U,0,100)/100*E.h;Ce(e,E,[50,100].map(U=>({v:U,y:P(U)})),U=>`${U}%`);let F=f.map(U=>[p(U.t),P(U.pop??0)]);e.save(),e.beginPath(),Pe(e,F),e.lineTo(F.at(-1)[0],E.y+E.h),e.lineTo(F[0][0],E.y+E.h),e.closePath();let G=e.createLinearGradient(0,E.y,0,E.y+E.h);G.addColorStop(0,j(K[4],.55)),G.addColorStop(1,j(K[4],.04)),e.fillStyle=G,e.fill(),e.restore(),ke(e,F,K[4],{width:1.6,glow:7}),e.save(),e.font=$e,e.textAlign="center",e.textBaseline="bottom",e.fillStyle=K[0];let W=-999,O=e.measureText("100%").width+6;for(let U=1;U<f.length-1;U++){let ee=f[U];if((ee.precip??0)<.02||(ee.precip??0)<=(f[U-1].precip??0)||(ee.precip??0)<(f[U+1].precip??0))continue;let B=p(ee.t),q=e.measureText(`${ee.precip.toFixed(2)}"`).width;B-W<46||B-q/2<h+4||B+q/2>h+c-O||(e.fillText(`${ee.precip.toFixed(2)}"`,B,P(ee.pop??0)-4),W=B)}e.restore(),Me(e,E.x+2,E.y-11,"precip probability"),N.push({key:"pop",box:E,yOf:P})}if(C.wind){let E=C.wind,P=Math.max(...f.map(O=>O.gust??O.wind??0),10)*1.12,F=O=>E.y+E.h-H(O,0,P)/P*E.h;Ce(e,E,We(0,P,Be(E.h,2)).map(O=>({v:O,y:F(O)})),O=>String(Math.round(O)));let G=f.map(O=>[p(O.t),F(O.gust??O.wind??0)]);e.save(),e.beginPath(),Pe(e,G),e.lineTo(G.at(-1)[0],E.y+E.h),e.lineTo(G[0][0],E.y+E.h),e.closePath(),e.fillStyle=j(R.serious,.16),e.fill(),e.restore(),ke(e,G,j(R.serious,.85),{width:1.2,glow:5}),ke(e,f.map(O=>[p(O.t),F(O.wind??0)]),K[3],{width:1.8,glow:8}),e.save(),e.strokeStyle=j(K[3],.55),e.lineWidth=1;let W=Math.max(1,Math.round(f.length/(c/26)));for(let O=0;O<f.length;O+=W){let U=f[O];if(U.windDir==null)continue;let ee=p(U.t),B=E.y+E.h-5,q=(U.windDir-90+180)*Math.PI/180;e.save(),e.translate(ee,B),e.rotate(q),e.beginPath(),e.moveTo(-4,0),e.lineTo(4,0),e.moveTo(4,0),e.lineTo(1.5,-2),e.moveTo(4,0),e.lineTo(1.5,2),e.stroke(),e.restore()}e.restore(),vt(e,E,E.y-11,"wind mph",[{label:"sustained",short:"wind",color:K[3]},{label:"gusts",color:R.serious}],{short:"wind"}),N.push({key:"wind",box:E,yOf:F})}if(C.cloud){let E=C.cloud,P=f.length,F=Math.max(1,c/P),G=[["cloudHigh",j(K[4],.55)],["cloudMid",j(K[0],.5)],["cloudLow",j(ve,.45)]];f.forEach((W,O)=>{let U=h+O*c/P,ee=E.y,B=E.h/3;G.forEach(([q,ne],J)=>{let x=H((W[q]??0)/100,0,1);e.fillStyle=ne,e.fillRect(U,ee+(B-2)*(1-x),Math.max(1,F-.5),(B-2)*x),ee+=B})}),e.save(),e.font=ye,e.textAlign="right",e.textBaseline="middle",["HIGH","MID","LOW"].forEach((W,O)=>{let U=E.y+E.h/3*(O+.5);e.fillStyle="rgba(22,33,47,.75)",e.fillRect(E.x+E.w-30,U-5,30,10),e.fillStyle=se,Ae(e,W,E.x+E.w-2,U)}),e.restore(),Me(e,E.x+2,E.y-11,"cloud decks %"),N.push({key:"cloud",box:E})}if(C.pressure){let E=C.pressure,P=f.map(O=>O.pressure).filter(O=>O!=null),F=Math.min(...P)-1,G=Math.max(...P)+1,W=O=>E.y+E.h-(O-F)/(G-F)*E.h;Ce(e,E,We(F,G,Be(E.h,2)).map(O=>({v:O,y:W(O)})),O=>(O*.02953).toFixed(2)),ke(e,f.filter(O=>O.pressure!=null).map(O=>[p(O.t),W(O.pressure)]),K[3],{width:1.8,glow:8}),Me(e,E.x+2,E.y-11,"pressure inHg"),N.push({key:"pressure",box:E,yOf:W})}if(C.uv){let E=C.uv,P=W=>E.y+E.h-H(W,0,12)/12*E.h;Ce(e,E,[3,6,8,11].map(W=>({v:W,y:P(W)})),String);let F=f.length,G=Math.max(1,c/F-1);f.forEach((W,O)=>{let U=W.uv??0;if(U<=.05)return;let ee=h+O*c/F,B=U<3?R.good:U<6?R.warn:U<8?R.serious:U<11?R.crit:K[3];Ve(e,ee,P(U),G,E.y+E.h,j(B,.8))}),Me(e,E.x+2,E.y-11,"uv index"),N.push({key:"uv",box:E,yOf:P})}if(C.cape){let E=C.cape,P=Math.max(...f.map(W=>W.cape??0),500)*1.1,F=W=>E.y+E.h-H(W,0,P)/P*E.h;Ce(e,E,We(0,P,Be(E.h,2)).map(W=>({v:W,y:F(W)})),W=>String(Math.round(W)));let G=f.map(W=>[p(W.t),F(W.cape??0)]);e.save(),e.beginPath(),Pe(e,G),e.lineTo(G.at(-1)[0],E.y+E.h),e.lineTo(G[0][0],E.y+E.h),e.closePath(),e.fillStyle=j(R.crit,.18),e.fill(),e.restore(),ke(e,G,R.crit,{width:1.6,glow:7}),Me(e,E.x+2,E.y-11,"CAPE J/kg"),N.push({key:"cape",box:E,yOf:F})}if(S){e.save(),e.font=$e,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let E=(g.hi-g.lo)/36e5,P=E>200?24:E>96?12:E>40?6:E>16?3:1,F=e.measureText("00:00").width+8,G=c/Math.max(E,1),W=[1,3,6,12,24,48].filter(O=>O>=P).find(O=>O*G>=F)??48;for(let O of f){let U=i.hourOfDay(O.t);if(Math.abs(U-Math.round(U))>.01||Math.round(U)%W!==0)continue;let ee=p(O.t);ee<h+10||ee>h+c-10||e.fillText(i.hm(O.t),ee,o-a+4)}e.restore()}if(y!=null&&y>=g.lo&&y<=g.hi&&Ot(e,p(y),D,j(R.good,.9),"NOW",{dash:[3,3]}),b!=null&&Math.abs(b-(y??b))>9e4&&b>=g.lo&&b<=g.hi&&Ot(e,p(b),D,K[1],null),n&&n.x>h&&n.x<h+c){let E=T(n.x),P=Yo(f,E);if(P){let F=p(P.t);e.save(),e.strokeStyle="rgba(255,255,255,.35)",e.setLineDash([2,3]),e.lineWidth=1,e.beginPath(),e.moveTo(Math.round(F)+.5,m),e.lineTo(Math.round(F)+.5,m+D.h),e.stroke(),e.restore();for(let W of N){if(!W.yOf)continue;let O=W.key==="temp"?P.temp:W.key==="pop"?P.pop??0:W.key==="wind"?P.wind:W.key==="pressure"?P.pressure:W.key==="uv"?P.uv:W.key==="cape"?P.cape:null;O!=null&&(e.save(),e.fillStyle=ve,e.shadowColor=K[0],e.shadowBlur=5,e.beginPath(),e.arc(F,W.yOf(O),3.5,0,Math.PI*2),e.fill(),e.restore())}let G=[`${i.weekday(P.t)} ${i.hm(P.t)}|`];C.temp&&(G.push(`TEMP|${Z.temp(P.temp)}`),G.push(`FEELS|${Z.temp(P.feels)}`)),C.pop&&(G.push(`RAIN CHANCE|${Z.pct(P.pop)}`),(P.precip??0)>.001&&G.push(`AMOUNT|${Z.inches(P.precip)}"`)),C.wind&&G.push(`WIND|${Z.wind(P.wind)} ${me(P.windDir)}`),C.pressure&&G.push(`PRESSURE|${Z.pressure(P.pressure)}`),C.uv&&G.push(`UV|${P.uv?.toFixed(1)??"--"}`),C.cape&&G.push(`CAPE|${Math.round(P.cape??0)}`),G.push(`SKY|${Qe(Math.round(P.code??0)).label}`),et(e,F,n.y,G,t,o,"#3fd0d8",{pin:n.coarse})}}return{xOf:p,tOf:T,boxes:C}}function Yo(e,t){let o=null,n=1/0;for(let s of e){let l=Math.abs(s.t-t);l<n&&(n=l,o=s)}return o}function xo(e,t,o,n,{rows:s,tf:l,now:v}){if(!s?.length)return;let g=4,b=34,y=16,i=20,u={x:g,y,w:t-g-b,h:o-y-i};if(u.w<30||u.h<20)return;let S=Math.min(...s.map($=>$.min)),h=Math.max(...s.map($=>$.max)),d=S-2,m=h+2,a=$=>u.x+($-s[0].t)/(s.at(-1).t-s[0].t)*u.w,c=$=>u.y+u.h-($-d)/(m-d)*u.h;Ce(e,u,We(d,m,Be(u.h,4)).map($=>({v:$,y:c($)})),$=>`${Math.round($)}\xB0`),e.save(),e.beginPath(),s.forEach(($,k)=>k?e.lineTo(a($.t),c($.max)):e.moveTo(a($.t),c($.max)));for(let $=s.length-1;$>=0;$--)e.lineTo(a(s[$].t),c(s[$].min));e.closePath();let f=e.createLinearGradient(u.x,0,u.x+u.w,0);f.addColorStop(0,j(K[0],.3)),f.addColorStop(1,j(K[0],.1)),e.fillStyle=f,e.fill(),e.strokeStyle=j(K[0],.35),e.lineWidth=1,e.stroke(),e.restore(),ke(e,s.map($=>[a($.t),c($.mean)]),K[0],{width:2,glow:10}),e.save(),e.strokeStyle=lo,e.font=$e,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let p="",T=e.measureText("WED").width+8,M=-1e9;for(let $ of s){let k=l.isoDate($.t);if(k===p)continue;p=k;let A=a($.t);e.beginPath(),e.moveTo(A+.5,u.y),e.lineTo(A+.5,u.y+u.h),e.stroke(),!(A<u.x+12||A>u.x+u.w-12||A-M<T)&&(e.fillText(l.weekday($.t).toUpperCase(),A,o-i+5),M=A)}if(e.restore(),v>=s[0].t&&v<=s.at(-1).t&&Ot(e,a(v),u,j(R.good,.9),"NOW",{dash:[3,3]}),vt(e,u,3,"model agreement \xB0F",[{label:"ensemble mean",short:"mean",color:K[0]},{label:"model range",short:"range",color:j(K[0],.35)}],{short:"model spread \xB0F"}),n&&n.x>u.x&&n.x<u.x+u.w){let $=s[0].t+(n.x-u.x)/u.w*(s.at(-1).t-s[0].t),k=Yo(s,$);if(k){let A=a(k.t);e.save(),e.strokeStyle="rgba(255,255,255,.3)",e.setLineDash([2,3]),e.beginPath(),e.moveTo(A+.5,u.y),e.lineTo(A+.5,u.y+u.h),e.stroke(),e.restore();let L=k.spread<2?"HIGH":k.spread<5?"MODERATE":k.spread<9?"LOW":"VERY LOW";et(e,A,n.y,[`${l.weekday(k.t)} ${l.hm(k.t)}|`,`MEAN|${Z.tempP(k.mean)}`,`RANGE|${Z.temp(k.min)}\u2013${Z.temp(k.max)}`,`SPREAD|${k.spread.toFixed(1)}\xB0`,`CONFIDENCE|${L}`,k.precipAgree!=null?`MODELS WET|${Math.round(k.precipAgree*100)}%`:null].filter(Boolean),t,o,"#3fd0d8",{pin:n.coarse})}}}function Zo(e,t,o,n,{days:s,climate:l,tf:v,doyOf:g}){if(!s?.length||!l?.doy?.length)return;let b=4,y=34,i=16,u=20,S={x:b,y:i,w:t-b-y,h:o-i-u};if(S.w<40||S.h<30)return;let h=s.map(k=>{let A=l.doy[g(k.t)];return A?{...k,c:A}:null}).filter(Boolean);if(!h.length)return;let d=h.flatMap(k=>[k.c.recordHigh,k.c.recordLow,k.tmax,k.tmin]).filter(k=>k!=null),m=Math.min(...d)-3,a=Math.max(...d)+3,c=h.length,f=S.w/c,p=k=>S.x+f*(k+.5),T=k=>S.y+S.h-(k-m)/(a-m)*S.h;Ce(e,S,We(m,a,Be(S.h,4)).map(k=>({v:k,y:T(k)})),k=>`${Math.round(k)}\xB0`),e.save(),e.beginPath(),h.forEach((k,A)=>A?e.lineTo(p(A),T(k.c.recordHigh)):e.moveTo(p(A),T(k.c.recordHigh)));for(let k=c-1;k>=0;k--)e.lineTo(p(k),T(h[k].c.recordLow));e.closePath(),e.fillStyle="rgba(255,255,255,.045)",e.fill(),e.restore(),e.save(),e.beginPath(),h.forEach((k,A)=>A?e.lineTo(p(A),T(k.c.normalHigh)):e.moveTo(p(A),T(k.c.normalHigh)));for(let k=c-1;k>=0;k--)e.lineTo(p(k),T(h[k].c.normalLow));e.closePath(),e.fillStyle="rgba(141,154,171,.20)",e.fill(),e.strokeStyle="rgba(141,154,171,.45)",e.setLineDash([3,3]),e.lineWidth=1,e.stroke(),e.restore();let M=Math.min(15,f*.42);h.forEach((k,A)=>{if(k.tmax==null||k.tmin==null)return;let L=(k.tmax-k.c.normalHigh+(k.tmin-(k.c.normalLow??k.c.normalHigh)))/2,C=H(Math.abs(L)/15,0,1),D=L>=0?_e("#8d9aab","#f2b45a",C):_e("#8d9aab","#7fb2f0",C),N=p(A)-M/2,E=T(k.tmax),P=T(k.tmin);e.save(),e.shadowColor=D,e.shadowBlur=5,e.fillStyle=D;let F=Math.min(4,M/2);e.beginPath(),e.moveTo(N,P-F),e.lineTo(N,E+F),e.quadraticCurveTo(N,E,N+F,E),e.lineTo(N+M-F,E),e.quadraticCurveTo(N+M,E,N+M,E+F),e.lineTo(N+M,P-F),e.quadraticCurveTo(N+M,P,N+M-F,P),e.lineTo(N+F,P),e.quadraticCurveTo(N,P,N,P-F),e.closePath(),e.fill(),e.restore(),k.tmax>=k.c.recordHigh&&(e.save(),e.fillStyle=R.crit,e.font=$e,e.textAlign="center",e.textBaseline="bottom",Ae(e,"REC",p(A),T(k.tmax)-4),e.restore())}),e.save(),e.font=$e,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let $=Rt(c,S.w,e.measureText("WED").width,{least:c>12?2:1});if(h.forEach((k,A)=>{A%$||Oe(e,v.weekday(k.t).toUpperCase(),p(A),o-u+5,0,t)}),e.restore(),vt(e,S,3,"forecast vs climate record \xB0F",[{label:"forecast",color:"#f2b45a"},{label:"normal",color:"rgba(141,154,171,.7)",dash:!0},{label:"record range",short:"record",color:"rgba(255,255,255,.2)"}],{short:"climate record \xB0F"}),n&&n.x>S.x&&n.x<S.x+S.w){let k=H(Math.floor((n.x-S.x)/f),0,c-1),A=h[k],L=A.tmax-A.c.normalHigh;et(e,p(k),n.y,[`${v.weekday(A.t)} ${v.monthDay(A.t)}|`,`FORECAST|${Z.temp(A.tmin)} \u2013 ${Z.temp(A.tmax)}`,`NORMAL|${Z.temp(A.c.normalLow)} \u2013 ${Z.temp(A.c.normalHigh)}`,`HIGH vs NORMAL|${Z.signed(L)}\xB0`,`RECORD HIGH|${Z.temp(A.c.recordHigh)} (${A.c.recordHighYear})`,`RECORD LOW|${Z.temp(A.c.recordLow)} (${A.c.recordLowYear})`],t,o,L>=0?"#f2b45a":"#7fb2f0",{pin:n.coarse})}}function Jo(e,t,o,n,{rows:s,tf:l,now:v}){if(!s?.length)return;let g=4,b=22,y=14,i=18,u={x:g,y,w:t-g-b,h:o-y-i};if(u.w<30)return;let S=s.length,h=Math.max(2,u.w/S-2),d=Math.max(5.6,Math.ceil(Math.max(...s.map(p=>p.kp))+.8)),m=p=>u.y+u.h-H(p,0,d)/d*u.h;Ce(e,u,[3,5,7].filter(p=>p<=d).map(p=>({v:p,y:m(p)})),String),e.save(),e.strokeStyle=j(R.serious,.5),e.setLineDash([4,3]),e.lineWidth=1,e.beginPath(),e.moveTo(u.x,m(5)),e.lineTo(u.x+u.w,m(5)),e.stroke(),e.setLineDash([]),e.font=ye,e.fillStyle=j(R.serious,.8),e.textAlign="left",e.textBaseline="bottom",Ae(e,"STORM",u.x+3,m(5)-2),e.restore(),s.forEach((p,T)=>{let M=p.kp<3?K[0]:p.kp<5?R.good:p.kp<6?R.warn:p.kp<7?R.serious:R.crit,$=u.x+T*u.w/S;Ve(e,$,m(Math.min(p.kp,d)),h,u.y+u.h,j(M,p.observed==="observed"?.9:.55))}),e.save(),e.font=$e,e.fillStyle=se,e.textAlign="center",e.textBaseline="top";let a="",c=e.measureText("WED").width+8,f=-1e9;if(s.forEach((p,T)=>{let M=l.isoDate(p.t);if(M===a)return;a=M;let $=u.x+T*u.w/S+h/2;$<u.x+10||$>u.x+u.w-10||$-f<c||(e.fillText(l.weekday(p.t).toUpperCase(),$,o-i+4),f=$)}),e.restore(),Me(e,u.x+2,2,"planetary K index"),n&&n.x>u.x&&n.x<u.x+u.w){let p=H(Math.floor((n.x-u.x)/u.w*S),0,S-1),T=s[p];et(e,u.x+p*u.w/S+h/2,n.y,[`${l.weekday(T.t)} ${l.hm(T.t)}|`,`Kp|${T.kp.toFixed(2)}`,`STATUS|${(T.observed||"predicted").toUpperCase()}`],t,o,K[3],{pin:n.coarse})}}var Ft=(e,t,o)=>o>=6&&o<22;function ie(e,t,o,n,s){return e==null?.5:e>=o&&e<=n?1:e<o?t>=o?1:H((e-t)/(o-t),0,1):s<=n?1:H((s-e)/(s-n),0,1)}var zt={walk:{label:"WALK",icon:"\u{1F6B6}",color:"#3fd0d8",hours:Ft,score(e){return[["temperature",ie(e.feels??e.temp,30,50,75,95),.3],["dry",1-H((e.pop??0)/100,0,1)*.9,.24],["wind",ie(e.wind,-1,0,12,30),.12],["humidity",ie(e.dew,-20,20,60,76),.1],["UV",ie(e.uv,-1,0,5,11),.07],["air quality",ie(e.air?.aqi,-1,0,50,160),.07],["daylight",e.isDay?1:.5,.1]]}},bike:{label:"BIKE",icon:"\u{1F6B2}",color:"#8fdc6a",hours:Ft,score(e){return[["temperature",ie(e.feels??e.temp,25,58,78,98),.26],["dry",1-H((e.pop??0)/100,0,1),.22],["wind",ie(e.gust??e.wind,-1,0,8,24),.24],["visibility",ie(e.vis,0,8e3,1/0,1/0),.08],["UV",ie(e.uv,-1,0,5,11),.05],["air quality",ie(e.air?.aqi,-1,0,50,150),.05],["daylight",e.isDay?1:.35,.1]]}},grill:{label:"GRILL",icon:"\u{1F525}",color:"#f2b45a",hours:Ft,score(e){return[["dry",1-H((e.pop??0)/100,0,1)*1,.34],["temperature",ie(e.temp,35,62,88,104),.24],["wind",ie(e.wind,-1,0,10,22),.24],["daylight or dusk",e.isDay?1:.55,.1],["humidity",ie(e.dew,-20,20,64,78),.08]]}},stargaze:{label:"STARGAZE",icon:"\u2726",color:"#b39dfa",hours:e=>!e.isDay,score(e,t){return[["darkness",e.isDay?0:1,.26],["clear sky",1-H((e.cloud??0)/100,0,1),.32],["no moon",1-H(t?.moonFraction??.5,0,1)*(t?.moonUp?1:.15),.18],["transparency",ie(e.vis,0,2e4,1/0,1/0),.1],["low humidity",ie(e.rh,-1,0,65,100),.08],["calm",ie(e.wind,-1,0,8,28),.06]]}},photo:{label:"PHOTO",icon:"\u25CE",color:"#f07aa6",hours:(e,t)=>!!e.isDay||t?.sunAltDeg!=null&&t.sunAltDeg>-8,score(e,t){let o=t?.sunAltDeg==null?.4:Math.exp(-Math.pow((t.sunAltDeg-3)/7,2)),n=1-Math.abs((e.cloud??50)/100-.45)*1.6;return[["golden light",H(o,0,1),.4],["sky texture",H(n,0,1),.26],["dry",1-H((e.pop??0)/100,0,1)*.7,.18],["clarity",ie(e.vis,0,15e3,1/0,1/0),.16]]}},swim:{label:"SWIM",icon:"\u{1F3CA}",color:"#7fb2f0",hours:(e,t,o)=>!!e.isDay&&o>=7&&o<20,score(e){let t=[95,96,99].includes(Number(e.code));return[["temperature",ie(e.feels??e.temp,65,80,95,105),.34],["dry",1-H((e.pop??0)/100,0,1),.18],["no thunder",t?0:1,.1],["sunshine",ie(e.cloud,-1,0,40,100),.12],["wind",ie(e.wind,-1,0,10,25),.12],["UV",ie(e.uv,-1,2,7,11),.08],["air quality",ie(e.air?.aqi,-1,0,50,150),.06]]}},openWindows:{label:"OPEN UP",icon:"\u{1FA9F}",color:"#5cd6bc",hours:Ft,score(e){return[["comfortable air",ie(e.temp,40,62,76,90),.34],["dry air",ie(e.dew,-20,25,58,70),.24],["clean air",ie(e.air?.aqi,-1,0,50,130),.22],["no rain",1-H((e.pop??0)/100,0,1),.12],["calm",ie(e.wind,-1,0,14,34),.08]]}}},_t=Object.keys(zt),Bt=e=>zt[e];function Wt(e,t,o){let n=zt[e];if(!n||!t)return null;let s=n.score(t,o),l=0;for(let[,b,y]of s)l+=H(b,0,1)*y;let v=null,g=0;for(let[b,y,i]of s){let u=(1-H(y,0,1))*i;u>g&&(g=u,v=b)}return{score:Math.round(H(l,0,1)*100),limiter:g>.06?v:null,parts:s.map(([b,y,i])=>({name:b,value:H(y,0,1),weight:i}))}}function ea(e,t){let o=e.fmt?.hourOfDay?e.fmt.hourOfDay(t):NaN;return Number.isFinite(o)?o:new Date(t).getHours()}function Qo(e,t,o=36){let n=zt[e];if(!n)return[];let s=Date.now(),l=s+o*36e5;return t.hours.filter(v=>v.t>=s-18e5&&v.t<=l).map(v=>{let g=oa(t,v.t),b=n.hours?!!n.hours(v,g,ea(t,v.t)):!0;return{t:v.t,eligible:b,...Wt(e,{...v,air:ta(t,v.t)},g)}})}function Xo(e,t,{hours:o=36,at:n=90}={}){let l=Qo(e,t,o).filter(v=>v.eligible);return{great:l.filter(v=>v.score>=n).length,eligible:l.length}}function Ut(e,t,{hours:o=36,limit:n=3,minScore:s=55}={}){let l=Qo(e,t,o);if(!l.length)return[];for(let y of l)y.eligible||(y.score=-1/0);let v=12,g=new Array(l.length).fill(!1),b=[];for(let y=0;y<n;y++){let i=-1;for(let a=0;a<l.length;a++)g[a]||l[a].score<s||(i<0||l[a].score>l[i].score)&&(i=a);if(i<0)break;let u=l[i].score,S=Math.max(s,u-v),h=i,d=i;for(;h-1>=0&&!g[h-1]&&l[h-1].score>=S;)h--;for(;d+1<l.length&&!g[d+1]&&l[d+1].score>=S;)d++;for(let a=h;a<=d;a++)g[a]=!0;let m=0;for(let a=h;a<=d;a++)m+=l[a].score;b.push({start:l[h].t,end:l[d].t+36e5,peakAt:l[i].t,peak:u,avg:Math.round(m/(d-h+1)),hours:d-h+1,limiter:l[i].limiter,parts:l[i].parts})}return b.sort((y,i)=>i.peak-y.peak||y.start-i.start)}function ta(e,t){if(!e.air?.length)return null;let o=null,n=1/0;for(let s of e.air){let l=Math.abs(s.t-t);l<n&&(n=l,o=s)}return n<36e5*2?o:null}function oa(e,t){let o=e.frame(t);return o?{sunAltDeg:o.sun.altDeg,moonFraction:o.moon.fraction,moonUp:o.moon.altDeg>0}:{}}function yt(e){let t=Date.now(),o=t+6*36e5,n=(e.min15?.length?e.min15:e.hours).filter(b=>b.t>=t-9e5&&b.t<=o);if(n.length<2)return null;let s=.002,l=(n[0].precip??0)>=s,v=null;for(let b of n)if((b.precip??0)>=s!==l){v=b;break}let g=n.reduce((b,y)=>(y.precip??0)>(b.precip??0)?y:b,n[0]);return{raining:l,changeAt:v?.t??null,minutes:v?Math.round((v.t-t)/6e4):null,peak:g.precip??0,peakAt:g.t,resolution:e.min15?.length?15:60,series:n.map(b=>({t:b.t,p:b.precip??0}))}}function en(e,t){return e?e.raining?e.minutes!=null?`Rain now \u2014 easing in about ${e.minutes} min`:"Rain now \u2014 no let-up in the next 6 hours":e.minutes!=null&&e.minutes<=240?`${e.peak>.08?"Heavy rain":e.peak>.02?"Rain":"Light rain"} starting in ${e.minutes} min (${t.hm(e.changeAt)})`:null:null}var Gt=e=>e<0?0:e>1?1:e,ge=e=>typeof e=="number"&&Number.isFinite(e)?e:null;function tn(e,t,o={},n={}){if(!t)return null;let s=ge(t.temperature_2m),l=String(o.temperature_2m||"").includes("F"),v=ge(t.wind_speed_10m),g=/mp\/?h|mph/i.test(String(o.wind_speed_10m||"")),b=ge(t.precipitation),y=/inch/i.test(String(o.precipitation||""));return{name:e,tempRaw:s,tempC:s===null?null:l?(s-32)/1.8:s,windKmh:v===null?null:g?v*1.609344:v,precipMm:b===null?null:y?b*25.4:b,cloudPct:ge(t.cloud_cover),night:t.is_day===0,...n}}function wt(e){let t=ge(e?.tempC);if(t===null)return null;let o=Gt(1-Math.abs(t-21)/18),n=Gt(1-(ge(e?.precipMm)??0)/2),s=Gt(1-(ge(e?.cloudPct)??0)/100*.6),l=Gt(1-Math.max(0,(ge(e?.windKmh)??0)-20)/40);return Math.round(100*(.4*o+.3*n+.2*s+.1*l))}function qt(e){let t=ge(e?.precipMm)??0,o=ge(e?.cloudPct),n=ge(e?.windKmh)??0;return t>=.5?"raining":t>0?"drizzling":n>=20+40/2?"blowing hard":o===null?null:o<=15?"clear":o<=45?"some cloud":o<=80?"cloudy":"overcast"}function na(e,t){let o=wt(e),n=wt(t);if(n===null)return null;let s=ge(t.tempC)!==null&&ge(e?.tempC)!==null?Math.round(t.tempC-e.tempC):null,l=ge(t.tempRaw)!==null&&ge(e?.tempRaw)!==null?Math.round(t.tempRaw-e.tempRaw):null;return{name:t.name,score:n,deltaScore:o===null?null:n-o,deltaC:s,deltaShown:l===null?s:l,better:o!==null&&n>o,headline:qt(t),tempC:ge(t.tempC),localHour:ge(t.localHour),night:t.night===!0}}function on(e,t){let o=(Array.isArray(t)?t:[]).map(n=>na(e,n)).filter(Boolean);return o.sort((n,s)=>s.score-n.score||(s.deltaC??0)-(n.deltaC??0)||String(n.name).localeCompare(String(s.name))),o}function co(e){if(!e)return"";let t=[],o=e.deltaShown??e.deltaC;return o!==null&&o!==0?t.push(`${Math.abs(o)}\xB0 ${o>0?"warmer":"colder"}`):o===0&&t.push("same temperature"),e.headline&&t.push(e.headline),e.night&&e.localHour!==null&&t.push(`${e.localHour}:00 there`),t.join(", ")}function nn(e,t){if(!t.length)return"Nowhere to compare against right now.";let o=t.filter(l=>l.better);if(!o.length)return`Nowhere on the list beats ${e} right now.`;let n=o[0],s=o.length-1;return`${n.name} is better than ${e} right now \u2014 ${co(n)}.`+(s>0?` So ${s===1?"is one other":`are ${s} others`}.`:"")}var aa="../countdown/stats.json",an=[{place:"San Francisco, California",lat:37.7749,lon:-122.4194},{place:"Vancouver, Canada",lat:49.2497,lon:-123.1193},{place:"Grants Pass, Oregon",lat:42.4393,lon:-123.3307}],sa=600*1e3;function sn(e){e.className="panel elsewhere",e.innerHTML=`
    <div class="hd">ELSEWHERE<span class="rule"></span><span class="val" id="ew-count">\u2014</span></div>
    <div class="body">
      <div class="ew-list" id="ew-list"><div class="ew-empty">Looking\u2026</div></div>
      <p class="ew-say" id="ew-say"></p>
    </div>`;let t=S=>e.querySelector(`#${S}`),o=null,n=0,s=[],l="",v=!1;async function g(){if(o)return o;try{let S=await(await fetch(new URL(aa,location.href),{cache:"no-cache"})).json(),h=Array.isArray(S?.trips)?S.trips:[],d=new Date,m=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`,a=f=>typeof f.date!="string"||(f.date.length===7?`${f.date}-01`:f.date)<=m,c=new Set;o=h.filter(f=>f&&typeof f.lat=="number"&&typeof f.lon=="number"&&a(f)&&typeof f.place=="string"&&!c.has(f.place)&&c.add(f.place)),o.length||(console.warn("ELSEWHERE: trip list had no usable coordinates; using the fallback"),o=an)}catch(S){console.warn("ELSEWHERE: could not read the trip list, using the fallback \u2014",S.message),o=an}return o}async function b(S){try{let d=(await ce.bundle(S.lat,S.lon))?.forecast?.data;if(!d?.current)return null;let m=Number(String(d.current.time||"").slice(11,13));return tn(S.place,d.current,d.current_units,{localHour:Number.isFinite(m)?m:null})}catch{return null}}async function y(){let S=r.loc;if(!S||v)return;let h=`${S.lat?.toFixed(2)},${S.lon?.toFixed(2)}`;if(!(h===l&&Date.now()-n<sa)){v=!0;try{let d=await g(),m=await b({place:S.name||"here",lat:S.lat,lon:S.lon});if(!m)return;let a=(await Promise.all(d.map(b))).filter(Boolean);s=on(m,a),l=h,n=Date.now(),i(m),u(m)}finally{v=!1}}}function i(S){let h=wt(S),d=s.filter(c=>c.better);if(t("ew-count").textContent=s.length?d.length?`${d.length} better`:"none better":"\u2014",!s.length){t("ew-list").innerHTML='<div class="ew-empty">No places to compare.</div>',t("ew-say").textContent="";return}let m=c=>`
      <div class="ew-row${c.better?" is-better":""}">
        <span class="ew-name">${te(c.name)}</span>
        <span class="ew-what">${te(co(c))}</span>
      </div>`,a=`
      <div class="ew-here">
        <span class="ew-name">${te(S.name)}</span>
        <span class="ew-what">here \xB7 ${te(qt(S)||"")}${Number.isFinite(h)?` \xB7 ${h}/100`:""}</span>
      </div>`;t("ew-list").innerHTML=d.map(m).join("")+a+s.filter(c=>!c.better).map(m).join(""),t("ew-say").textContent=nn(S.name,s)}async function u(S){try{let h={here:S.name,hereSky:qt(S),hereScore:wt(S),rows:s.map(a=>({name:a.name,delta:a.deltaShown??a.deltaC,sky:a.headline,better:a.better,night:a.night}))},d=btoa(unescape(encodeURIComponent(JSON.stringify(h)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),m=await ce.elsewhere(d);m?.text&&l&&(t("ew-say").textContent=m.text)}catch{}}return{update(){y()},onHide(){}}}function rn(e){e.className="view deck active",e.innerHTML=`
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
  `;let t=a=>e.querySelector("#"+a),o=sn(t("d-elsewhere")),n=le(t("d-meteo"),(a,c,f,p)=>{let T=Date.now();Ht(a,c,f,p,{hours:r.hours,days:r.days,tf:r.fmt,span:{lo:r.cursor-12*36e5,hi:r.cursor+36*36e5},cursor:r.cursor,now:T,panels:["temp","pop","wind"]})},{onPick:({x:a,w:c})=>{let f=r.cursor-432e5,p=r.cursor+36*36e5,T=c-34;r.playing=!1,r.scrubTo(f+(a-4)/T*(p-f))}}),s=le(t("d-spark"),(a,c,f)=>{let p=r.hours.filter(M=>M.t>=r.cursor-36e5&&M.t<=r.cursor+864e5);if(p.length<2)return;let T=Wo(a,{x:0,y:4,w:c,h:f-14},p.map(M=>M.temp),{color:K[0],glow:9});a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="center",a.textBaseline="bottom";for(let M=0;M<p.length;M+=6)Oe(a,r.fmt.hour(p[M].t).replace(/\s/g,""),M/(p.length-1)*c,f,0,c);a.restore(),T?.length&&(a.save(),a.fillStyle=ve,a.shadowColor=K[0],a.shadowBlur=5,a.beginPath(),a.arc(T[1]?.[0]??T[0][0],T[1]?.[1]??T[0][1],3,0,Math.PI*2),a.fill(),a.restore())}),l=le(t("d-moondisc"),(a,c,f)=>{let p=r.frame();p&&Nt(a,c/2,f/2,Math.max(10,Math.min(c,f)/2-3),p.moon.phase,p.moon.fraction)}),v=le(t("d-nc"),(a,c,f)=>{let p=yt(r);if(!p?.series?.length)return;let T=Math.max(...p.series.map(k=>k.p),.02),M=p.series.length,$=Math.max(1,c/M-.6);p.series.forEach((k,A)=>{let L=A*c/M,C=k.p>0?Math.max(1.5,k.p/T*f):0;C&&Ve(a,L,f-C,$,f,j(k.p>.08?R.crit:k.p>.02?K[0]:K[4],.9),2)}),a.save(),a.strokeStyle="rgba(255,255,255,.10)",a.beginPath(),a.moveTo(0,f-.5),a.lineTo(c,f-.5),a.stroke(),a.restore()}),g=[["g-wind",(a,c,f)=>{let p=r.frame(),T=Math.min(c,f)/2-16;Uo(a,c/2,f/2-4,Math.max(14,T),{dir:p?.windDir,speed:p?.wind,gust:p?.gust,color:K[3]})}],["g-hum",(a,c,f)=>{let p=r.frame(),T=Math.min(c,f)/2-18;je(a,c/2,f/2-6,Math.max(14,T),{value:p?.rh,min:0,max:100,color:K[4],label:"humidity",unit:"%",sub:p?qe(p.dew).name:""})}],["g-pres",(a,c,f)=>{let p=r.frame(),T=Math.min(c,f)/2-18,M=p?.pressure?p.pressure*.029529983:null;je(a,c/2,f/2-6,Math.max(14,T),{value:M,min:28.5,max:31,color:K[3],label:"pressure",unit:"inHg",decimals:2,sub:b()})}],["g-uv",(a,c,f)=>{let p=r.frame(),T=Math.min(c,f)/2-18;je(a,c/2,f/2-6,Math.max(14,T),{value:p?.uv,min:0,max:12,color:Ge(p?.uv).color,label:"uv index",unit:"index",decimals:1,sub:Ge(p?.uv).name,bands:[{from:0,to:3,color:R.good},{from:3,to:6,color:R.warn},{from:6,to:8,color:R.serious},{from:8,to:11,color:R.crit},{from:11,to:12,color:K[3]}]})}],["g-aqi",(a,c,f)=>{let T=r.frame()?.air?.aqi??r.airNow?.aqi,M=ze(T),$=Math.min(c,f)/2-18;je(a,c/2,f/2-6,Math.max(14,$),{value:T,min:0,max:200,color:M.color,label:"air quality",unit:"US AQI",sub:M.name.length>12?"SENSITIVE":M.name,bands:[{from:0,to:50,color:R.good},{from:50,to:100,color:R.warn},{from:100,to:150,color:R.serious},{from:150,to:200,color:R.crit}]})}],["g-vis",(a,c,f)=>{let p=r.frame(),T=p?.vis!=null?p.vis/1609.344:null,M=Math.min(c,f)/2-18;je(a,c/2,f/2-6,Math.max(14,M),{value:T==null?null:Math.min(T,10),min:0,max:10,color:K[0],label:"visibility",unit:"miles",decimals:1,sub:T==null?"":T>=9?"CLEAR":T>=3?"HAZY":T>=1?"POOR":"FOG"})}]].map(([a,c])=>le(t(a),c));function b(){let a=r.cursor,c=r.hours.find(T=>T.t>=a-3*36e5),f=r.hours.find(T=>T.t>=a);if(!c?.pressure||!f?.pressure)return"";let p=(f.pressure-c.pressure)*.029529983;return Math.abs(p)<.02?"STEADY":p>0?`RISING ${p.toFixed(2)}`:`FALLING ${Math.abs(p).toFixed(2)}`}function y(){let a=r.frame();if(!a)return;let c=r.fmt;t("d-temp").innerHTML=`${a.temp==null?"--":Math.round(a.temp)}<sup>\xB0F</sup>`,t("d-cond").textContent=a.wx.label,t("d-glyph").textContent=eo(Math.round(a.code??0),a.isDay>.5),t("d-feels").textContent=Z.temp(a.feels),t("d-dew").textContent=Z.temp(a.dew),t("d-obs").textContent=r.atNow?`LIVE \xB7 ${Xt(r.lastFetch)}`:`PROJECTED \xB7 ${c.hm(r.cursor)}`;let f=r.observed,p=t("d-obsline");if(r.atNow&&f?.tempF!=null){let O=a.temp!=null?a.temp-f.tempF:null;p.innerHTML=`observed <b>${Math.round(f.tempF)}\xB0</b><span> \xB7 ${te(f.name||f.station)} ${f.distanceMi} mi \xB7 ${Xt(Date.parse(f.time))}</span>`+(O!=null&&Math.abs(O)>=1.5?`<em> \xB7 model runs ${Z.signed(O,0)}\xB0</em>`:""),p.style.display=""}else p.style.display="none";let T=a.day;t("d-hi").textContent=Z.temp(T?.tmax),t("d-lo").textContent=Z.temp(T?.tmin);let M=t("d-anom"),$=r.climate?.doy?.[m(r.cursor)];if($&&T?.tmax!=null){let O=T.tmax-$.normalHigh;M.textContent=`${Z.signed(O,1)}\xB0`,M.style.color=Math.abs(O)<2?pe:O>0?"#f2b45a":"#7fb2f0"}else M.textContent="--",M.style.color="";let k=r.sunTimesFor();t("d-sunrise").textContent=c.hm(k.sunrise),t("d-sunset").textContent=c.hm(k.sunset),t("d-daylight").textContent=T?.daylight?st(T.daylight):"--";let A=r.alerts,L=t("d-alertPanel");L.style.display=A.length?"":"none",t("d-alertN").textContent=String(A.length),t("d-alerts").innerHTML=A.slice(0,4).map(O=>`
      <div class="alert-item" style="--ac:${gt(O.event,O.severity)}">
        <b>${te(O.event||"Alert")}</b>
        <span>until ${c.weekday(O.expires||O.ends)} ${c.hm(O.expires||O.ends)}</span>
      </div>`).join("");let C=yt(r),D=en(C,c),N=t("d-ncline");if(D)N.textContent=D,N.className="nowcast-line wet";else{let O=r.hours.find(U=>U.t>Date.now()&&(U.pop??0)>=40);N.textContent=O?`Dry for 6+ hours. Next real chance ${c.weekday(O.t)} ${c.hm(O.t)} (${Math.round(O.pop)}%).`:"Dry. No meaningful precipitation in the forecast window.",N.className="nowcast-line"}t("d-ncres").textContent=C?`${C.resolution}-MIN`:"\u2014";let E=a.moon,P=r.moonTimesFor();t("d-moonname").textContent=`${Math.round(E.fraction*100)}% LIT`,t("d-sunmoon").innerHTML=`
      <dl style="margin:0">
        ${h("Sun altitude",`${a.sun.altDeg.toFixed(1)}\xB0 ${me(a.sun.compass)}`)}
        ${h("Golden hour",`${c.hm(k.goldenHour)} \u2013 ${c.hm(k.sunset)}`)}
        ${h("Blue hour",`${c.hm(k.sunset)} \u2013 ${c.hm(k.dusk)}`)}
        ${h("Astro dark",isNaN(+k.night)?"none tonight":c.hm(k.night))}
        ${h("Moon",`${d(E.phase)}`)}
        ${h("Moon alt",`${E.altDeg.toFixed(1)}\xB0 ${me(E.compass)}`)}
        ${h("Moonrise",P.rise?c.hm(P.rise):"\u2014")}
        ${h("Moonset",P.set?c.hm(P.set):"\u2014")}
      </dl>`;let F=Lt(a.wind);t("n-wind").textContent=`${F.name} \xB7 from ${me(a.windDir)}`,t("n-hum").textContent=qe(a.dew).note,t("n-pres").textContent=a.pressure?`${Math.round(a.pressure)} hPa`:"";let G=Et(a.uv,r.settings.skinType);t("n-uv").textContent=G==null?"no burn risk":G>180?"burn risk negligible":`burn in ~${G} min`;let W=a.air?.aqi??r.airNow?.aqi;t("n-aqi").textContent=a.air?.pm25!=null?`PM2.5 ${a.air.pm25.toFixed(1)} \xB5g/m\xB3`:W!=null?"":"no data",t("n-vis").textContent=a.vis!=null?`${(a.vis/1609.344).toFixed(1)} mi`:"",t("d-instnote").textContent=r.atNow?"LIVE":c.hm(r.cursor),u(),S(),l.render();for(let O of g)O.render();n.render(),s.render(),v.render()}let i=null;function u(){let a=r.fmt,c=T=>`${a.weekday(T)} ${a.hour(T)}`,f=(T,M)=>a.isoDate(T)===a.isoDate(M)?`${a.weekday(T)} ${a.hour(T)}\u2013${a.hour(M)}`:`${c(T)} \u2013 ${c(M)}`,p=_t.map(T=>{let M=Bt(T),$=Ut(T,r,{hours:36,limit:1,minScore:50})[0],k=Xo(T,r,{hours:36,at:90});return{k:T,meta:M,w:$,g:k}}).sort((T,M)=>M.g.great-T.g.great||(M.w?.peak??0)-(T.w?.peak??0));t("d-act").innerHTML=p.map(({k:T,meta:M,w:$,g:k})=>{let A=k.great,L=k.eligible?A/k.eligible:0,C=A>0?R.good:($?.peak??0)>=60?R.warn:R.serious,D=$?`<b class="act-best">Best ${c($.peakAt)}</b><span class="act-good">Good ${f($.start,$.end)}</span>`+(A===0?`<span class="act-note">Best hour scores ${$.peak}/100</span>`:"")+($.limiter?`<span class="act-note">Held back by ${$.limiter}</span>`:""):'<span class="act-note">No good time in the next 36 hours</span>',N=i===T&&$,E=$?$.parts.map(P=>{let F=Math.round((1-P.value)*P.weight*100);return`<span class="act-factor"><span class="act-fname">${P.name}</span><span class="meter act-fbar" style="--ac:${F===0?R.good:P.value>=.6?R.warn:R.serious}"><i style="width:${Math.round(P.value*100)}%"></i></span><span class="act-fpts">${F?"\u2212"+F:"full marks"}</span></span>`}).join(""):"";return`
        <button type="button" class="act-row" data-act="${T}" aria-expanded="${N?"true":"false"}"
                aria-controls="act-why-${T}"${$?"":" disabled"}>
          <span class="act-icon" style="color:${M.color}">${M.icon}</span>
          <span class="act-text">
            <span class="act-name">${M.label}</span>
            <span class="act-when">${D}</span>
            <span class="meter act-bar" style="--ac:${C}"><i style="width:${Math.round(L*100)}%"></i></span>
          </span>
          <span class="act-score" style="color:${C}">${A}<small class="act-unit">great hours</small></span>
        </button>
        <div class="act-why" id="act-why-${T}"${N?"":" hidden"}>
          <span class="act-whyhd">Why the best hour (${$?c($.peakAt):""}) scores ${$?.peak??0}</span>${E}
        </div>`}).join("")}t("d-act").addEventListener("click",a=>{let c=a.target.closest(".act-row");!c||c.disabled||(i=i===c.dataset.act?null:c.dataset.act,u(),t("d-act").querySelector(`.act-row[data-act="${c.dataset.act}"]`)?.focus())}),t("d-act").addEventListener("keydown",a=>{if(a.key!=="Escape"||!i)return;let c=i;i=null,u(),t("d-act").querySelector(`.act-row[data-act="${c}"]`)?.focus()});function S(){let a=r.fmt,c=a.isoDate(Date.now()),f=r.days.filter(k=>k.tmax!=null&&a.isoDate(k.t)>=c);if(!f.length)return;let p=Math.min(...f.map(k=>k.tmin)),T=Math.max(...f.map(k=>k.tmax)),M=a.isoDate(Date.now()),$=a.isoDate(r.cursor);t("d-tenday").innerHTML=f.map(k=>{let A=a.isoDate(k.t),L=(T-k.tmax)/(T-p||1)*100,C=(k.tmin-p)/(T-p||1)*100,D=`linear-gradient(to top, ${Ee(k.tmin)}, ${Ee(k.tmax)})`;return`
        <div class="tenday-col ${A===M?"today":""} ${A===$?"cursor":""}" data-t="${k.t}">
          <div class="td-day">${A===M?"TODAY":a.weekday(k.t)}</div>
          <div class="td-date">${a.monthDay(k.t)}</div>
          <div class="td-glyph" title="${Qe(Math.round(k.code)).long}">${eo(Math.round(k.code),!0)}</div>
          <div class="td-hi">${Math.round(k.tmax)}\xB0</div>
          <div class="td-bar"><i style="top:${L}%;bottom:${C}%;background:${D};box-shadow:0 0 8px ${Ee(k.tmax)}66"></i></div>
          <div class="td-lo">${Math.round(k.tmin)}\xB0</div>
          <div class="td-pop">${(k.pop??0)>=10?`${Math.round(k.pop)}%`:""}</div>
        </div>`}).join(""),t("d-tdnote").textContent=`${f.length} DAYS AHEAD`,t("d-tenday").querySelectorAll(".tenday-col").forEach(k=>{k.addEventListener("click",()=>{r.playing=!1,r.scrubTo(+k.dataset.t+13*36e5)})})}let h=(a,c)=>`<div class="kv"><dt>${a}</dt><dd>${c}</dd></div>`,d=a=>["New Moon","Waxing Crescent","First Quarter","Waxing Gibbous","Full Moon","Waning Gibbous","Last Quarter","Waning Crescent"][Math.round((a%1+1)%1*8)%8],m=a=>{let c=r.fmt.isoDate(a),[,f,p]=c.split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][f-1]+p-1};return{update(){y(),o.update()},onHide(){o.onHide()}}}var ut="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas",jt="grayscale(1) brightness(1.18) contrast(1.05) sepia(.6) hue-rotate(170deg) saturate(1.3)",Kt="grayscale(1) brightness(1.9) contrast(1.1) sepia(.4) hue-rotate(170deg) saturate(.8)";var we={lonToWorld:(e,t)=>(e+180)/360*Math.pow(2,t)*256,latToWorld:(e,t)=>{let o=Math.sin(Math.max(-85.05,Math.min(85.05,e))*Math.PI/180);return(.5-Math.log((1+o)/(1-o))/(4*Math.PI))*Math.pow(2,t)*256},worldToLon:(e,t)=>e/(Math.pow(2,t)*256)*360-180,worldToLat:(e,t)=>{let o=Math.PI-2*Math.PI*e/(Math.pow(2,t)*256);return 180/Math.PI*Math.atan(.5*(Math.exp(o)-Math.exp(-o)))}},ot=new Map,Vt=0,ia=[1500,4e3];function ln(e,t,o){let n=new Image;t.img=n,t.state="loading",Vt++,n.crossOrigin="anonymous",n.onload=()=>{t.state="ok",Vt--,o?.()},n.onerror=()=>{Vt--;let s=ia[t.tries++];if(s===void 0){t.state="err";return}setTimeout(()=>{ot.get(e)===t&&ln(e,t,o)},s)},n.src=e}function ra(e,t){let o=ot.get(e);if(o)return o.state==="ok"?o.img:null;if(Vt>24)return null;let n={img:null,state:"loading",tries:0};if(ot.set(e,n),ln(e,n,t),ot.size>600){let s=Math.floor(150);for(let l of ot.keys()){if(s--<=0)break;ot.delete(l)}}return null}var la=10,ct=class{constructor(t,{center:o=[0,0],zoom:n=7,minZoom:s=2,maxZoom:l=12,onMove:v,onTap:g}={}){this.canvas=t,this.ctx=t.getContext("2d"),this.lat=o[0],this.lon=o[1],this.zoom=n,this.minZoom=s,this.maxZoom=l,this.onMove=v,this.onTap=g,this.layers=[],this.overlays=[],this.dirty=!0,this.w=0,this.h=0,this._raf=null,this._bind(),this._ro=new ResizeObserver(()=>this.resize()),this._ro.observe(t),this.resize()}resize(){let t=Math.min(window.devicePixelRatio||1,2),o=this.canvas.clientWidth,n=this.canvas.clientHeight;!o||!n||(this.canvas.width=Math.round(o*t),this.canvas.height=Math.round(n*t),this.ctx.setTransform(t,0,0,t,0,0),this.w=o,this.h=n,this.invalidate())}invalidate(){this._raf||(this._raf=requestAnimationFrame(()=>{this._raf=null,this.render()}))}setView(t,o,n){this.lat=t,this.lon=o,n!=null&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n))),this.invalidate(),this.onMove?.(this)}project(t,o){let n=this.zoom;return[we.lonToWorld(o,n)-we.lonToWorld(this.lon,n)+this.w/2,we.latToWorld(t,n)-we.latToWorld(this.lat,n)+this.h/2]}unproject(t,o){let n=this.zoom;return[we.worldToLat(we.latToWorld(this.lat,n)+o-this.h/2,n),we.worldToLon(we.lonToWorld(this.lon,n)+t-this.w/2,n)]}_placeAt(t,o,n,s){let l=this.zoom;this.lon=we.worldToLon(we.lonToWorld(o,l)+this.w/2-n,l),this.lat=Math.max(-85,Math.min(85,we.worldToLat(we.latToWorld(t,l)+this.h/2-s,l)))}_zoomAbout(t,o,n){let[s,l]=this.unproject(t,o);this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n)),this._placeAt(s,l,t,o)}_bind(){let t=this.canvas,o=new Map,n=null,s=null,l=y=>({x:y.clientX-s.left,y:y.clientY-s.top}),v=()=>{let y=[...o.values()];return{n:y.length,x:y.reduce((i,u)=>i+u.x,0)/y.length,y:y.reduce((i,u)=>i+u.y,0)/y.length,span:y.length<2?0:Math.hypot(y[0].x-y[1].x,y[0].y-y[1].y)}},g=()=>{if(!o.size){n=null;return}let y=v(),[i,u]=this.unproject(y.x,y.y);n={lat:i,lon:u,span:y.span,zoom:this.zoom}};t.addEventListener("pointerdown",y=>{if(o.size>=2)return;s=t.getBoundingClientRect();let i=l(y);o.set(y.pointerId,{...i,x0:i.x,y0:i.y});try{t.setPointerCapture(y.pointerId)}catch{}g(),t.style.cursor="grabbing"}),t.addEventListener("pointermove",y=>{if(!n||!o.has(y.pointerId))return;let i=o.get(y.pointerId);o.set(y.pointerId,{...l(y),x0:i.x0,y0:i.y0});let u=v();u.n>1&&n.span>20&&u.span>8&&(this.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,n.zoom+Math.log2(u.span/n.span)))),this._placeAt(n.lat,n.lon,u.x,u.y),this.invalidate(),this.onMove?.(this)});let b=y=>{let i=o.get(y.pointerId);if(o.delete(y.pointerId)){try{t.releasePointerCapture(y.pointerId)}catch{}this.onTap&&!o.size&&Math.hypot(i.x-i.x0,i.y-i.y0)<la&&this.onTap({x:i.x,y:i.y},y),g(),o.size||(t.style.cursor="grab")}};t.addEventListener("pointerup",b),t.addEventListener("pointercancel",b),t.addEventListener("wheel",y=>{y.preventDefault();let i=t.getBoundingClientRect(),u=-y.deltaY*(y.deltaMode===1?.05:.0022);this._zoomAbout(y.clientX-i.left,y.clientY-i.top,this.zoom+u),this.invalidate(),this.onMove?.(this)},{passive:!1});for(let y of["gesturestart","gesturechange","gestureend"])t.addEventListener(y,i=>i.preventDefault());t.style.cursor="grab",t.style.touchAction="none"}_layerTiles(t,o,n,s){let{w:l,h:v}=this,g=Math.min(o,t.maxTileZoom??o),b=256*Math.pow(2,this.zoom-g),y=Math.pow(2,g),i=Math.floor(n/b),u=Math.floor((n+l)/b),S=Math.floor(s/b),h=Math.floor((s+v)/b),d=[];for(let m=S;m<=h;m++)if(!(m<0||m>=y))for(let a=i;a<=u;a++){let c=(a%y+y)%y,f=t.url(g,c,m);f&&d.push({tx:a,ty:m,url:f})}return{size:b,tiles:d}}tilesSettled(t){let o=this.layers.find(v=>v.name===t);if(!o||o.enabled===!1||o.opacity===0||!this.w||!this.h)return!0;let n=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),s=we.lonToWorld(this.lon,this.zoom)-this.w/2,l=we.latToWorld(this.lat,this.zoom)-this.h/2;return this._layerTiles(o,n,s,l).tiles.every(({url:v})=>{let g=ot.get(v)?.state;return g==="ok"||g==="err"})}render(){let{ctx:t,w:o,h:n}=this;if(!o||!n)return;t.clearRect(0,0,o,n),t.fillStyle="#0f1826",t.fillRect(0,0,o,n);let s=Math.max(0,Math.min(this.maxZoom,Math.round(this.zoom))),l=we.lonToWorld(this.lon,this.zoom)-o/2,v=we.latToWorld(this.lat,this.zoom)-n/2,g=()=>this.invalidate();for(let b of this.layers){if(b.enabled===!1||b.opacity===0)continue;let{size:y,tiles:i}=this._layerTiles(b,s,l,v);t.save(),t.globalAlpha=b.opacity??1,b.filter&&(t.filter=b.filter),b.blend&&(t.globalCompositeOperation=b.blend);let u=.5;for(let{tx:S,ty:h,url:d}of i){let m=ra(d,g);m&&t.drawImage(m,Math.round(S*y-l)-u,Math.round(h*y-v)-u,Math.ceil(y)+u*2,Math.ceil(y)+u*2)}t.restore()}for(let b of this.overlays){t.save();try{b(t,this)}catch(y){console.error("[map overlay]",y)}t.restore()}}destroy(){this._ro.disconnect()}};function dn(e,t,o,{stroke:n,fill:s,width:l=1.5,glow:v=8}){if(!o)return;let g=o.type==="Polygon"?[o.coordinates]:o.type==="MultiPolygon"?o.coordinates:null;if(g){e.beginPath();for(let b of g)for(let y of b)y.forEach(([i,u],S)=>{let[h,d]=t.project(u,i);S===0?e.moveTo(h,d):e.lineTo(h,d)}),e.closePath();s&&(e.fillStyle=s,e.fill("evenodd")),n&&(e.save(),v&&(e.shadowColor=n,e.shadowBlur=v/2),e.strokeStyle=n,e.lineWidth=l,e.stroke(),e.restore())}}function Yt(e,t,o,n="#f07aa6",s=null,l=0){e.save(),e.shadowColor=n,e.shadowBlur=7,e.strokeStyle=n,e.lineWidth=1.5;let v=7;e.beginPath(),e.arc(t,o,v,0,Math.PI*2),e.stroke(),e.beginPath();for(let[g,b]of[[-1,0],[1,0],[0,-1],[0,1]])e.moveTo(t+g*(v+2),o+b*(v+2)),e.lineTo(t+g*(v+7),o+b*(v+7));if(e.stroke(),e.fillStyle=n,e.beginPath(),e.arc(t,o,2.2,0,Math.PI*2),e.fill(),l>0&&(e.globalAlpha=1-l,e.beginPath(),e.arc(t,o,v+l*26,0,Math.PI*2),e.stroke(),e.globalAlpha=1),s){e.shadowBlur=0,e.font="600 11.5px 'Chakra Petch', sans-serif",e.letterSpacing="1.4px",e.textAlign="left",e.textBaseline="middle";let g=e.measureText(s).width+10;e.fillStyle="rgba(22,33,47,.85)",e.fillRect(t+v+8,o-7,g,14),e.fillStyle=n,e.fillText(s,t+v+13,o)}e.restore()}function xt(e,t,o,n){let s=156543.03392*Math.cos(t.lat*Math.PI/180)/Math.pow(2,t.zoom),v=s*110/1609.344,b=[1,2,5,10,20,50,100,200,500,1e3].reduce((i,u)=>Math.abs(u-v)<Math.abs(i-v)?u:i),y=b*1609.344/s;e.save(),e.strokeStyle="rgba(221,226,232,.75)",e.lineWidth=1,e.beginPath(),e.moveTo(o,n-4),e.lineTo(o,n),e.lineTo(o+y,n),e.lineTo(o+y,n-4),e.stroke(),e.font="500 11.5px 'JetBrains Mono', monospace",e.fillStyle="rgba(221,226,232,.75)",e.textAlign="center",e.textBaseline="bottom",e.fillText(`${b} mi`,o+y/2,n-5),e.restore()}var da=5;function cn(e){e.className="view radar",e.innerHTML=`
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
  `;let t=L=>e.querySelector("#"+L),o=[],n=0,s=0,l=!1,v=0,g="",b=null,y=performance.now(),i="",u=new ct(t("r-map"),{center:[r.loc?.lat??0,r.loc?.lon??0],zoom:7,minZoom:3,maxZoom:11,onMove:()=>f()});u.layers=[{name:"base",url:(L,C,D)=>`${ut}/World_Dark_Gray_Base/MapServer/tile/${L}/${D}/${C}`,filter:jt,opacity:1},{name:"radar",url:(L,C,D)=>{let N=o[n];return!N||!i?null:`${i}${N.path}/256/${L}/${C}/${D}/4/1_1.png`},opacity:.82,blend:"screen",maxTileZoom:7},{name:"labels",url:(L,C,D)=>`${ut}/World_Dark_Gray_Reference/MapServer/tile/${L}/${D}/${C}`,filter:Kt,opacity:1}];let S=L=>u.layers.find(C=>C.name===L);u.overlays.push((L,C)=>{if(S("alerts")?.enabled!==!1&&h)for(let D of r.alerts){if(!D.geometry)continue;let N=gt(D.event,D.severity);dn(L,C,D.geometry,{stroke:N,fill:j(N,.12),width:1.5,glow:10})}if(r.loc){let[D,N]=C.project(r.loc.lat,r.loc.lon);Yt(L,D,N,K[1],r.loc.name.toUpperCase())}xt(L,C,14,C.h-14),L.save(),L.strokeStyle="rgba(63,208,216,.06)",L.lineWidth=1;for(let D=1;D<4;D++)L.beginPath(),L.moveTo(C.w*D/4,0),L.lineTo(C.w*D/4,C.h),L.moveTo(0,C.h*D/4),L.lineTo(C.w,C.h*D/4),L.stroke();L.restore()});let h=!0,d=le(t("r-strip"),(L,C,D)=>{if(!o.length)return;let N=o.length,E=Math.max(2,C/N-2),P=o.findIndex(F=>F.kind==="nowcast");if(o.forEach((F,G)=>{let W=G*C/N,O=F.kind==="past",U=G===n?K[1]:O?K[0]:R.warn;L.fillStyle=j(U,G===n?1:.3),L.fillRect(W,G===n?2:6,E,G===n?D-4:D-12)}),P>0){let F=P*C/N-1;L.save(),L.strokeStyle=j(R.warn,.8),L.setLineDash([2,2]),L.beginPath(),L.moveTo(F,0),L.lineTo(F,D),L.stroke(),L.restore()}},{onPick:({x:L,w:C})=>{if(!o.length)return;let D=o[H(Math.floor(L/C*o.length),0,o.length-1)];r.playing=!1,r.emit("play",!1),r.scrubTo(D.time*1e3)}});function m(L){let C=0,D=1/0;for(let N=0;N<o.length;N++){let E=Math.abs(o[N].time*1e3-L);E<D&&(D=E,C=N)}return C}function a(){if(!o.length)return;let L=m(r.cursor);L!==n&&(n=L,p())}function c(){t("r-play").textContent=r.playing?"\u275A\u275A":"\u25B6"}let f=()=>d.render();function p(){let L=o[n];if(!L)return;t("r-time").textContent=r.fmt.hm(L.time*1e3);let C=Math.round((Date.now()/1e3-L.time)/60);t("r-age").textContent=L.kind==="nowcast"?`FORECAST +${Math.abs(C)}m`:C<=1?"LATEST":`${C} MIN AGO`,t("r-age").style.color=L.kind==="nowcast"?R.warn:C<=12?R.good:pe,u.invalidate(),d.render()}async function T(){try{let L=r.radar||await ce.radar();i=L.host;let C=(L.radar?.past||[]).map(N=>({...N,kind:"past"})),D=(L.radar?.nowcast||[]).map(N=>({...N,kind:"nowcast"}));o=[...C,...D],n=m(r.cursor),t("r-src").textContent=D.length?`${C.length} OBS + ${D.length} FCST`:`${C.length} OBSERVED`,p(),M()}catch(L){console.error("[radar] frames",L),t("r-src").textContent="UNAVAILABLE"}}function M(){let L=[["#62a4ef","light"],["#6cc98f","moderate"],["#ecd46a","heavy"],["#f59a5b","very heavy"],["#f47171","intense"],["#c89af5","hail"]];t("r-legend").innerHTML='<span class="lg-title">intensity</span>'+L.map(([C,D])=>`<b><i style="background:${C}"></i>${D}</b>`).join("")}function $(){let L=r.fmt,C=r.frame(),D=[C?.t,C?.precip,C?.cape,C?.cloud,r.alerts.length,r.hours.length].join("|");if(D===g&&r.raw===b)return;g=D,b=r.raw;let N=r.alerts;t("r-alertn").textContent=String(N.length),t("r-alertlist").innerHTML=N.length?N.map(q=>`
      <div class="alert-item" style="--ac:${gt(q.event,q.severity)}">
        <b>${te(q.event)}</b>
        <span>${te(q.areaDesc||"").slice(0,90)}</span><br>
        <span>until ${L.weekday(q.expires)} ${L.hm(q.expires)}</span>
      </div>`).join(""):'<div class="nodata">no active alerts</div>';let E=r.frame(),P=r.hours.filter(q=>q.t>=Date.now()&&q.t<=Date.now()+6*36e5),F=P.reduce((q,ne)=>q+(ne.precip??0),0),G=Math.max(0,...P.map(q=>q.pop??0));t("r-cover").innerHTML=`
      <dl style="margin:0">
        ${A("Now",E?.wx.label??"--")}
        ${A("Rate",E?.precip!=null?`${E.precip.toFixed(3)} in/hr`:"--")}
        ${A("Next 6h total",`${F.toFixed(2)} in`)}
        ${A("Peak chance 6h",`${Math.round(G)}%`)}
        ${A("Cloud cover",E?.cloud!=null?`${Math.round(E.cloud)}%`:"--")}
        ${A("Freezing level",E?.freezing!=null?`${Math.round(E.freezing*3.28084)} ft`:"--")}
      </dl>`;let W=E?.cape??0,O=E?.li,U=E?.cin,ee=W<300?["STABLE",R.good]:W<1e3?["MARGINAL",K[0]]:W<2500?["MODERATE",R.warn]:W<4e3?["STRONG",R.serious]:["EXTREME",R.crit],B=Math.max(0,...r.hours.filter(q=>q.t>=Date.now()&&q.t<=Date.now()+24*36e5).map(q=>q.cape??0));t("r-conv").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px">
        <span class="num" style="font-size:1.5rem;font-weight:700;color:${ee[1]}">${Math.round(W)}</span>
        <span class="lbl">J/kg CAPE</span>
        <span class="chip" style="--ac:${ee[1]};margin-left:auto">${ee[0]}</span>
      </div>
      <div class="meter seg" style="--ac:${ee[1]};margin-bottom:8px"><i style="width:${H(W/4e3*100,0,100)}%"></i></div>
      <dl style="margin:0">
        ${A("Lifted index",O!=null?O.toFixed(1):"--")}
        ${A("Inhibition",U!=null?`${Math.round(U)} J/kg`:"--")}
        ${A("Peak CAPE 24h",`${Math.round(B)} J/kg`)}
      </dl>
      <div style="font-size:max(.58rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        CAPE is the energy available to a rising parcel. Above ~1000 J/kg with a
        negative lifted index, thunderstorms become plausible.
      </div>`}t("r-play").addEventListener("click",()=>{r.playing=!r.playing,r.emit("play",r.playing),c()}),r.on("play",c),r.on("cursor",()=>{r.view==="radar"&&(a(),c())}),t("r-center").addEventListener("click",()=>{r.loc&&u.setView(r.loc.lat,r.loc.lon,7)}),t("r-zin").addEventListener("click",()=>u.setView(u.lat,u.lon,u.zoom+1)),t("r-zout").addEventListener("click",()=>u.setView(u.lat,u.lon,u.zoom-1)),t("r-labels").addEventListener("click",L=>{let C=S("labels");C.enabled=C.enabled===!1,L.currentTarget.classList.toggle("on",C.enabled!==!1),u.invalidate()}),t("r-alerts").addEventListener("click",L=>{h=!h,L.currentTarget.classList.toggle("on",h),u.invalidate()});function k(L){if(r.view!=="radar"){y=L;return}let C=Math.min(.2,(L-y)/1e3);if(y=L,r.playing&&o.length){if(!l){if(v+=C,!u.tilesSettled("radar")&&v<da)return;l=!0}s+=C;let D=n===o.length-1?1.1:.42;if(s>=D){s=0;let N=(n+1)%o.length;r.hours.length?r.setCursor(o[N].time*1e3):(n=N,p())}}}requestAnimationFrame(function L(C){requestAnimationFrame(L),k(C)}),r.on("loc",()=>{r.loc&&u.setView(r.loc.lat,r.loc.lon,7)}),r.on("radar",T);let A=(L,C)=>`<div class="kv"><dt>${L}</dt><dd>${C}</dd></div>`;return T(),{map:u,update(){$(),u.invalidate()},onShow(){l=!1,v=0,s=0,u.resize(),d.render(),a(),r.playing=!0,r.emit("play",!0),c()},onHide(){r.playing=!1,r.emit("play",!1),r.following&&r.setCursor(Date.now())}}}function ca(e,t){if(!e?.length)return null;let o=null,n=1/0;for(let s of e){let l=Math.abs(s.t-t);l<n&&(n=l,o=s)}return n<=36e5?o:null}function un(e,t){for(let o of t){let n=e[o];if(n instanceof Date&&!Number.isNaN(+n))return{at:+n,kind:o}}return null}function ua(e,t,o,n,s){let l=un(t,["night","nauticalDusk","dusk"]),v=un(o,["nightEnd","nauticalDawn","dawn"]);if(!l||!v||v.at<=l.at)return{dark:null,samples:[],goodHours:0,score:0,reason:"no darkness"};let g=[],b=Math.ceil(l.at/36e5)*36e5;for(let $=b;$<=v.at;$+=36e5){let k=ca(e,$);if(!k)continue;let A=s($),L=n($)>0;g.push({t:$,cloud:k.cloud??null,moonUp:L,moonLit:A,washed:L&&A>=.25,clear:k.cloud!=null&&k.cloud<=30})}if(!g.length)return{dark:{from:l.at,to:v.at,kind:l.kind},samples:[],goodHours:0,score:0,reason:"beyond the forecast"};let y=$=>$.clear&&!$.washed,i=g.filter(y).length,u=g.filter($=>$.clear).length,S=g.filter($=>$.cloud!=null),h=S.length?S.reduce(($,k)=>$+k.cloud,0)/S.length:null,d=null,m=null;for(let $ of g.concat([null])){if($&&y($)){m=m||{from:$.t,to:$.t},m.to=$.t+36e5;continue}m&&(!d||m.to-m.from>d.to-d.from)&&(d=m),m=null}let a=(v.at-l.at)/36e5,c=s(l.at+(v.at-l.at)/2),f=g.filter($=>$.moonUp).length/g.length,p=d?(d.to-d.from)/36e5:0,T=.65*Math.min(1,p/4)+.25*Math.min(1,i/Math.max(a,1))+.1*Math.min(1,a/6),M=Math.round(100*Math.max(0,Math.min(1,T)-.08*f*c));return{dark:{from:l.at,to:v.at,kind:l.kind,hours:a},samples:g,goodHours:i,clearHours:u,cloudMean:h,moonLit:c,moonUpHours:g.filter($=>$.moonUp).length,best:d,score:M}}function hn(e,t,o,n,s,l=7,v=null){let{sunTimes:g,moonPosition:b,moonIllumination:y,toDeg:i}=s,u=[],S=v==null?(()=>{let m=new Date(n);return m.setHours(12,0,0,0),+m})():Math.floor((n+v)/(24*36e5))*24*36e5+12*36e5-v,h=m=>i(b(new Date(m),t,o).altitude),d=m=>y(new Date(m)).fraction;for(let m=0;m<l;m++){let a=new Date(S+m*24*36e5),c=new Date(S+(m+1)*24*36e5),f=ua(e,g(a,t,o),g(c,t,o),h,d);u.push({...f,index:m,day:+a})}return u}function uo(e){return e.slice(1).reduce((t,o)=>o.score>(t?.score??-1)?o:t,null)}function fn(e,t){let o=e[0],n=i=>t.hm(i);if(!o||!o.dark)return"No real darkness tonight at this latitude.";if(!o.samples.length)return"Tonight is beyond the forecast.";let s=uo(e),l=s&&s.score>o.score+15?s:null,v=i=>i.index===1?"Tomorrow":t.weekday(i.day),g=(i,u)=>`${i} ${u}${i===1?"":"s"}`,b=l?` ${v(l)} is the better night: ${g(l.goodHours,"clear moonless hour")}.`:"";if(o.best&&o.best.to-o.best.from>=2*36e5){let i=(o.best.to-o.best.from)/36e5,u=Math.round(i),S=o.moonLit>=.25&&o.moonUpHours?`, and the moon is ${Math.round(o.moonLit*100)}% lit`:"";if(o.dark.hours-i<1)return`Clear and moonless all night \u2014 about ${g(u,"hour")}, ${n(o.best.from)} to ${n(o.best.to)}${S}.`+b;if(u<3){let h=o.cloudMean!=null&&o.cloudMean>30?`, in a night averaging ${Math.round(o.cloudMean)}% cloud`:o.dark.hours<4?`, which is most of the ${g(Math.round(o.dark.hours),"hour")} of darkness`:"";return`A ${u}-hour window from ${n(o.best.from)}${h}${S}.`+b}return`Clear and moonless from ${n(o.best.from)} to ${n(o.best.to)} \u2014 about ${g(u,"hour")}${S}.`+b}return`Not tonight \u2014 ${o.cloudMean!=null&&o.cloudMean>30?`${Math.round(o.cloudMean)}% cloud through the dark hours`:o.moonUpHours&&o.moonLit>=.25?`a ${Math.round(o.moonLit*100)}% moon up for most of it`:"not much dark sky to work with"}.`+b}function mn(e){e.className="view skyview",e.innerHTML=`
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
  `;let t=a=>e.querySelector("#"+a),o=null;function n(){let{lat:a,lon:c}=r.loc||{lat:0,lon:0},f=r.fmt.isoDate(r.cursor),p=r.cursor;for(;r.fmt.isoDate(p-6e4)===f;)p-=6e4;let T=[],M=[];for(let $=0;$<=1440;$+=10){let k=new Date(p+$*6e4),A=xe(k,a,c),L=Ze(k,a,c);T.push({az:He(A.azimuth),alt:Fe(A.altitude),t:+k}),M.push({az:He(L.azimuth),alt:Fe(L.altitude),t:+k})}return{sun:T,moon:M,t0:p}}let s=le(t("s-dome"),(a,c,f,p)=>{let T=r.frame();if(!T)return;let{sun:M,moon:$}=n(),k=Math.min(c,f)/2-26,A=c/2,L=f/2;Go(a,A,L,k,{sunTrack:M,moonTrack:$,sun:{az:T.sun.compass,alt:T.sun.altDeg},moon:{az:T.moon.compass,alt:T.moon.altDeg},iss:o&&o.alt>0?o:null,night:T.sun.altDeg<-6?1:0}),a.save(),a.font="500 12px 'JetBrains Mono', monospace",a.textAlign="left",a.textBaseline="top";let C=[["SUN",`${T.sun.altDeg.toFixed(1)}\xB0  ${me(T.sun.compass)}`,"#f2b45a"],["MOON",`${T.moon.altDeg.toFixed(1)}\xB0  ${me(T.moon.compass)}`,"#7fb2f0"]];o&&C.push(["ISS",`${o.alt>0?`${o.alt.toFixed(0)}\xB0 ${me(o.az)}`:"below horizon"}`,"#8fdc6a"]),C.forEach(([D,N,E],P)=>{a.fillStyle=E,a.fillText(D,10,10+P*15),a.fillStyle=ve,a.fillText(N,52,10+P*15)}),a.restore()}),l=le(t("s-moon"),(a,c,f)=>{let p=r.frame();if(!p)return;let T=Math.min(c,f)/2-4;Nt(a,c/2,f/2,Math.max(10,T),p.moon.phase,p.moon.fraction)}),v=le(t("s-moonalt"),(a,c,f)=>{let{sun:p,moon:T}=n(),M={l:2,r:22,t:12,b:12},$={x:M.l,y:M.t,w:c-M.l-M.r,h:f-M.t-M.b};if($.w<30||$.h<20)return;let k=C=>$.y+$.h-(H(C,-60,90)+60)/150*$.h,A=C=>$.x+C/(T.length-1)*$.w;a.save(),a.strokeStyle="rgba(63,208,216,.30)",a.setLineDash([3,3]),a.beginPath(),a.moveTo($.x,k(0)),a.lineTo($.x+$.w,k(0)),a.stroke(),a.setLineDash([]),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="right",a.textBaseline="middle",a.fillText("0\xB0",$.x+$.w+18,k(0)),a.restore(),ke(a,p.map((C,D)=>[A(D),k(C.alt)]),"#f2b45a",{width:1.4,glow:6}),a.save(),a.setLineDash([3,3]),ke(a,T.map((C,D)=>[A(D),k(C.alt)]),"#7fb2f0",{width:1.6,glow:7}),a.restore();let L=H(Math.round((r.cursor-T[0].t)/(T.at(-1).t-T[0].t)*(T.length-1)),0,T.length-1);a.save(),a.strokeStyle=K[1],a.lineWidth=1,a.beginPath(),a.moveTo(A(L),$.y),a.lineTo(A(L),$.y+$.h),a.stroke(),a.restore(),a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="center",a.textBaseline="top";for(let C=0;C<=24;C+=6)C!==24&&Oe(a,String(C).padStart(2,"0"),A(C/24*(T.length-1)),f-M.b+1,0,c);a.restore(),Me(a,$.x+2,1,"altitude \u2014 sun solid, moon dashed")}),g=le(t("s-daybar"),(a,c,f)=>{let p=r.sunTimesFor(),T=r.fmt.isoDate(r.cursor),M=r.cursor;for(;r.fmt.isoDate(M-6e4)===T;)M-=6e4;let $=M+24*36e5,k=E=>(E-M)/($-M)*c,A=8,L=16,C=(E,P,F)=>{if(E==null||P==null||isNaN(+E)||isNaN(+P))return;let G=H(k(+E),0,c),W=H(k(+P),0,c);W<=G||(a.fillStyle=F,a.fillRect(G,A,W-G,L))};a.fillStyle="#0f1826",a.fillRect(0,A,c,L),C(p.nightEnd,p.nauticalDawn,"rgba(30,20,70,.9)"),C(p.nauticalDawn,p.dawn,"rgba(40,40,120,.9)"),C(p.dawn,p.sunrise,"rgba(90,60,150,.9)"),C(p.sunrise,p.goldenHourEnd,"rgba(245,154,91,.85)"),C(p.goldenHourEnd,p.goldenHour,"rgba(90,180,235,.75)"),C(p.goldenHour,p.sunset,"rgba(245,154,91,.85)"),C(p.sunset,p.dusk,"rgba(150,70,140,.9)"),C(p.dusk,p.nauticalDusk,"rgba(60,45,130,.9)"),C(p.nauticalDusk,p.night,"rgba(30,20,70,.9)"),a.save(),a.font="500 11.5px 'JetBrains Mono', monospace",a.fillStyle=se,a.textAlign="center",a.textBaseline="top",a.strokeStyle="rgba(255,255,255,.10)";for(let E=0;E<=24;E+=3){let P=E/24*c;a.beginPath(),a.moveTo(P,A+L),a.lineTo(P,A+L+3),a.stroke(),E%6===0&&E<24&&Oe(a,String(E).padStart(2,"0"),P,A+L+5,0,c)}a.restore();let D=(E,P,F)=>{if(E==null||isNaN(+E))return;let G=H(k(+E),6,c-6);a.save(),a.strokeStyle=F,a.lineWidth=1,a.beginPath(),a.moveTo(G,A-4),a.lineTo(G,A+L),a.stroke(),a.font="600 11.5px 'Chakra Petch', sans-serif",a.fillStyle=F,a.textAlign="center",a.textBaseline="bottom",a.fillText(P,G,A-5),a.restore()};D(p.sunrise,"\u2191","#f2b45a"),D(p.sunset,"\u2193","#f2b45a");let N=H(k(r.cursor),0,c);a.save(),a.strokeStyle=K[1],a.lineWidth=1.5,a.shadowColor=K[1],a.shadowBlur=4,a.beginPath(),a.moveTo(N,A-6),a.lineTo(N,A+L+2),a.stroke(),a.restore()}),b=le(t("s-kp"),(a,c,f,p)=>{let T=r.kpForecast();if(!T.length){y(a,c,f,"no space weather data");return}Jo(a,c,f,p,{rows:T,tf:r.fmt,now:Date.now()})});function y(a,c,f,p){a.save(),a.font="600 11.5px 'Chakra Petch', sans-serif",a.fillStyle=se,a.textAlign="center",a.textBaseline="middle",a.letterSpacing="1.6px",a.fillText(p.toUpperCase(),c/2,f/2),a.restore()}function i(a,c=Date.now()){let f=c,p=6*36e5,T=Je(new Date(f)).phase;for(let M=0;M<240;M++){f+=p;let $=Je(new Date(f)).phase;if(T<=a&&$>=a||T>$&&(T<=a||$>=a)){let A=f-p,L=f;for(let C=0;C<28;C++){let D=(A+L)/2,N=Je(new Date(D)).phase;N<a||N>.9&&a<.1?A=D:L=D}return(A+L)/2}T=$}return null}function u(){let a=r.frame();if(!a)return;let c=r.fmt;t("s-domewhen").textContent=r.atNow?"LIVE":`${c.weekday(r.cursor)} ${c.hm(r.cursor)}`;let f=r.moonTimesFor();t("s-mphase").textContent=bo(a.moon.phase).toUpperCase();let p=i(.5),T=i(0);t("s-moondl").innerHTML=`
      ${d("Illumination",`${(a.moon.fraction*100).toFixed(1)}%`)}
      ${d("Altitude",`${a.moon.altDeg.toFixed(1)}\xB0 ${me(a.moon.compass)}`)}
      ${d("Distance",`${Math.round(a.moon.distance).toLocaleString()} km`)}
      ${d("Moonrise",f.rise?c.hm(f.rise):f.alwaysUp?"always up":"\u2014")}
      ${d("Moonset",f.set?c.hm(f.set):f.alwaysDown?"never up":"\u2014")}
      ${d("Next full",p?`${c.monthDay(p)} ${c.hm(p)}`:"\u2014")}
      ${d("Next new",T?`${c.monthDay(T)} ${c.hm(T)}`:"\u2014")}
    `;let M=r.sunTimesFor(),$=a.day;t("s-daylen").textContent=$?.daylight?st($.daylight):"\u2014";let k="\u2014",A=r.days.findIndex(q=>c.isoDate(q.t)===c.isoDate(r.cursor));if(A>0&&r.days[A].daylight&&r.days[A-1].daylight){let q=r.days[A].daylight-r.days[A-1].daylight,ne=Math.abs(q)/60;k=`${q>=0?"+":"\u2212"}${Math.floor(ne)}m ${Math.round(ne%1*60)}s vs yesterday`}t("s-sundl").innerHTML=`
      ${d("First light",c.hm(M.dawn))}
      ${d("Sunrise",c.hm(M.sunrise))}
      ${d("Golden hour ends",c.hm(M.goldenHourEnd))}
      ${d("Solar noon",`${c.hm(M.solarNoon)} \xB7 ${h().toFixed(1)}\xB0`)}
      ${d("Golden hour",c.hm(M.goldenHour))}
      ${d("Sunset",c.hm(M.sunset))}
      ${d("Civil dusk",c.hm(M.dusk))}
      ${d("Astronomical dark",isNaN(+M.night)?"none tonight":c.hm(M.night))}
      ${d("Day length",k)}
    `;let L=r.currentKp(),C=At(L);t("s-kpnow").textContent=L!=null?`Kp ${L.toFixed(2)} \xB7 ${C.name}`:"NO DATA";let D=r.space,N=D?.wind?.ok?D.wind.data?.[0]?.proton_speed:null,E=D?.mag?.ok?D.mag.data?.[0]?.bt:null,P=D?.mag?.ok?D.mag.data?.[0]?.bz_gsm:null,F=D?.scales?.ok?D.scales.data?.["0"]:null;t("s-spacedl").innerHTML=`
      ${d("Solar wind",N!=null?`${N} km/s`:"\u2014")}
      ${d("IMF Bt / Bz",E!=null?`${E} / ${P} nT`:"\u2014")}
      ${d("Aurora visible to",C.lat!=null?`${C.lat}\xB0 latitude`:"\u2014")}
      ${d("Your latitude",`${Math.abs(r.loc.lat).toFixed(1)}\xB0 ${r.loc.lat>=0?"N":"S"}`)}
      ${d("Radio / Solar / Geo",F?`R${F.R?.Scale??0} S${F.S?.Scale??0} G${F.G?.Scale??0}`:"\u2014")}
    `;let G=a.air,W=Wt("stargaze",{...a,air:G},{sunAltDeg:a.sun.altDeg,moonFraction:a.moon.fraction,moonUp:a.moon.altDeg>0}),O=W?.score??0,U=O>=75?R.good:O>=50?R.warn:O>=30?R.serious:R.crit;t("s-seenow").textContent=`${O}/100`;let ee=r.hours.filter(q=>q.t>Date.now()&&q.t<Date.now()+30*36e5),B=null;for(let q of ee){let ne=r.frame(q.t);if(!ne||ne.sun.altDeg>-12)continue;let J=Wt("stargaze",ne,{sunAltDeg:ne.sun.altDeg,moonFraction:ne.moon.fraction,moonUp:ne.moon.altDeg>0});(!B||J.score>B.score)&&(B={t:q.t,score:J.score,limiter:J.limiter})}t("s-seeing").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:5px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${U}">${O}</span>
        <span class="lbl">stargazing now</span>
      </div>
      <div class="meter" style="--ac:${U};margin-bottom:9px"><i style="width:${O}%"></i></div>
      ${(W?.parts||[]).map(q=>`
        <div class="kv">
          <dt>${q.name}</dt>
          <dd style="display:flex;align-items:center;gap:6px">
            <span class="meter" style="width:52px;--ac:${q.value>.7?R.good:q.value>.4?R.warn:R.crit}">
              <i style="width:${q.value*100}%"></i></span>
            ${Math.round(q.value*100)}
          </dd>
        </div>`).join("")}
      <div style="margin-top:8px;font-size:max(.66rem,var(--fs-floor,0px));color:var(--dim);line-height:1.5">
        ${B?`Best hour right now: <b style="color:${ve}">${c.weekday(B.t)} ${c.hm(B.t)}</b> at ${B.score}/100${B.limiter?`, held back by ${B.limiter}`:""}.`:"No astronomical darkness in the next 30 hours."}
      </div>`,S(),s.render(),l.render(),v.render(),g.render(),b.render()}function S(){let a=t("s-tonight");if(!r.loc||!r.hours?.length){a.innerHTML="";return}let c=r.fmt,f=hn(r.hours,r.loc.lat,r.loc.lon,Date.now(),{sunTimes:$t,moonPosition:Ze,moonIllumination:Je,toDeg:Fe}),p=uo(f),T=Math.max(4,...f.map($=>$.goodHours)),M=$=>{let k=p&&$.index===p.index&&$.score>f[0].score,A=$.score>=75?R.good:$.score>=45?R.warn:R.crit;return`
        <div class="tn-n${k?" pick":""}${$.index===0?" now":""}"
             title="${$.goodHours} clear moonless hours of ${$.dark?$.dark.hours.toFixed(1):0} dark">
          <span class="tn-h">${$.dark?`${$.goodHours}h`:"\u2014"}</span>
          <span class="tn-bar"><i style="height:${Math.round($.goodHours/T*100)}%;background:${A}"></i></span>
          <span class="tn-d">${c.weekday($.day).slice(0,3).toUpperCase()}</span>
        </div>`};a.innerHTML=`
      <p class="tn-verdict">${te(fn(f,c))}</p>
      <div class="tn-week">${f.map(M).join("")}</div>
      <p class="tn-key">clear, moonless hours per night \xB7 next ${7}</p>`}function h(){let{lat:a,lon:c}=r.loc||{lat:0,lon:0},f=r.sunTimesFor();return!f.solarNoon||isNaN(+f.solarNoon)?0:Fe(xe(f.solarNoon,a,c).altitude)}let d=(a,c)=>`<div class="kv"><dt>${a}</dt><dd>${c}</dd></div>`;async function m(){if(r.view==="sky")try{let a=await ce.iss();if(a.pos?.ok){let c=a.pos.data,f=r.loc||{lat:0,lon:0};o={...mt(f.lat,f.lon,c.latitude,c.longitude,c.altitude),lat:c.latitude,lon:c.longitude,visibility:c.visibility},s.render()}}catch{}}return setInterval(m,8e3),{update:u,onShow(){m(),s.render(),l.render(),v.render(),g.render(),b.render()}}}var pn=[{key:"pm25",label:"PM2.5",unit:"\xB5g/m\xB3",ref:35,who:15,note:"fine particulate \u2014 lungs and bloodstream"},{key:"pm10",label:"PM10",unit:"\xB5g/m\xB3",ref:150,who:45,note:"coarse dust and pollen fragments"},{key:"o3",label:"Ozone",unit:"\xB5g/m\xB3",ref:140,who:100,note:"photochemical smog, peaks mid-afternoon"},{key:"no2",label:"NO\u2082",unit:"\xB5g/m\xB3",ref:200,who:25,note:"traffic and combustion"},{key:"so2",label:"SO\u2082",unit:"\xB5g/m\xB3",ref:350,who:40,note:"industry and shipping"},{key:"co",label:"CO",unit:"\xB5g/m\xB3",ref:1e4,who:4e3,note:"incomplete combustion"}],fa=["I very fair","II fair","III medium","IV olive","V brown","VI dark"];function gn(e){e.className="view airview",e.innerHTML=`
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
  `;let t=i=>e.querySelector("#"+i),o=le(t("a-gauge"),(i,u,S)=>{let d=r.frame()?.air?.aqi??r.airNow?.aqi,m=ze(d),a=Math.min(u,S)/2-22;je(i,u/2,S/2-4,Math.max(18,a),{value:d,min:0,max:300,color:m.color,label:"",unit:"US AQI",bands:[{from:0,to:50,color:R.good},{from:50,to:100,color:R.warn},{from:100,to:150,color:R.serious},{from:150,to:200,color:R.crit},{from:200,to:300,color:"#c89af5"}],ticks:6})}),n=le(t("a-uv"),(i,u,S,h)=>{let d=r.fmt.isoDate(r.cursor),m=r.hours.filter($=>r.fmt.isoDate($.t)===d);if(m.length<2)return;let a={l:2,r:24,t:12,b:14},c={x:a.l,y:a.t,w:u-a.l-a.r,h:S-a.t-a.b},f=$=>c.y+c.h-H($,0,12)/12*c.h;for(let[$,k,A]of[[3,R.good,"LOW"],[6,R.warn,"MOD"],[8,R.serious,"HIGH"],[11,R.crit,"V.HIGH"]])i.save(),i.strokeStyle=j(k,.3),i.setLineDash([3,3]),i.lineWidth=1,i.beginPath(),i.moveTo(c.x,f($)),i.lineTo(c.x+c.w,f($)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=j(k,.8),i.textAlign="right",i.textBaseline="bottom",Ae(i,A,c.x+c.w-2,f($)-1),i.restore();let p=m.length,T=Math.max(2,c.w/p-1.5);m.forEach(($,k)=>{let A=$.uv??0;if(A<=.03)return;let L=Ge(A).color;Ve(i,c.x+k*c.w/p,f(A),T,c.y+c.h,j(L,.85))});let M=m.map($=>[c.x+m.indexOf($)*c.w/p+T/2,f($.uvClear??0)]);i.save(),i.setLineDash([3,2]),i.strokeStyle=j(ve,.35),i.lineWidth=1,i.beginPath(),M.forEach(([$,k],A)=>A?i.lineTo($,k):i.moveTo($,k)),i.stroke(),i.restore(),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=se,i.textAlign="center",i.textBaseline="top",m.forEach(($,k)=>{let A=r.fmt.hourOfDay($.t);Math.round(A)%4||Math.abs(A-Math.round(A))>.02||Oe(i,r.fmt.hm($.t),c.x+k*c.w/p+T/2,S-a.b+3,0,u)}),i.restore(),Me(i,c.x+2,1,"uv index today \xB7 dashed = clear sky")}),s=le(t("a-fc"),(i,u,S,h)=>{let d=r.air.filter(A=>A.t>=Date.now()-216e5&&A.t<=Date.now()+3456e5);if(d.length<3){l(i,u,S,"no air quality forecast");return}let m={l:4,r:30,t:16,b:18},a={x:m.l,y:m.t,w:u-m.l-m.r,h:S-m.t-m.b},c=Math.max(110,Math.max(...d.map(A=>A.aqi??0))*1.15),f=A=>a.x+(A-d[0].t)/(d.at(-1).t-d[0].t)*a.w,p=A=>a.y+a.h-H(A,0,c)/c*a.h;for(let[A,L,C]of[[50,R.good,"GOOD"],[100,R.warn,"MODERATE"],[150,R.serious,"SENSITIVE"]])A>c||(i.save(),i.strokeStyle=j(L,.28),i.setLineDash([4,3]),i.beginPath(),i.moveTo(a.x,p(A)),i.lineTo(a.x+a.w,p(A)),i.stroke(),i.setLineDash([]),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=j(L,.85),i.textAlign="right",i.textBaseline="bottom",Ae(i,C,a.x+a.w-2,p(A)-2),i.restore());let T=d.length,M=Math.max(1,a.w/T-.5);d.forEach((A,L)=>{A.aqi!=null&&Ve(i,a.x+L*a.w/T,p(A.aqi),M,a.y+a.h,j(ze(A.aqi).color,.8),2)}),i.save(),i.font="500 11.5px 'JetBrains Mono', monospace",i.fillStyle=se,i.textAlign="center",i.textBaseline="top",i.strokeStyle="rgba(255,255,255,.07)";let $="";d.forEach((A,L)=>{let C=r.fmt.isoDate(A.t);if(C===$)return;$=C;let D=a.x+L*a.w/T;i.beginPath(),i.moveTo(D,a.y),i.lineTo(D,a.y+a.h),i.stroke(),D<a.x+a.w-20&&i.fillText(r.fmt.weekday(A.t).toUpperCase(),D+16,S-m.b+4)}),i.restore();let k=f(Date.now());if(k>a.x&&k<a.x+a.w&&(i.save(),i.strokeStyle=j(R.good,.85),i.setLineDash([3,3]),i.beginPath(),i.moveTo(k,a.y),i.lineTo(k,a.y+a.h),i.stroke(),i.restore()),Me(i,a.x+2,3,"us aqi \u2014 next 4 days"),h&&h.x>a.x&&h.x<a.x+a.w){let A=H(Math.round((h.x-a.x)/a.w*(T-1)),0,T-1),L=d[A],C=ze(L.aqi);i.save(),i.strokeStyle="rgba(255,255,255,.3)",i.beginPath(),i.moveTo(f(L.t),a.y),i.lineTo(f(L.t),a.y+a.h),i.stroke(),i.restore(),et(i,f(L.t),h.y,[`${r.fmt.weekday(L.t)} ${r.fmt.hm(L.t)}|`,`AQI|${Math.round(L.aqi??0)}`,`CATEGORY|${C.name}`,`PM2.5|${L.pm25?.toFixed(1)??"--"}`,`OZONE|${L.o3?.toFixed(0)??"--"}`],u,S,C.color,{pin:h.coarse})}});function l(i,u,S,h){i.save(),i.font="600 11.5px 'Chakra Petch', sans-serif",i.fillStyle=se,i.textAlign="center",i.textBaseline="middle",i.letterSpacing="1.6px",i.fillText(h.toUpperCase(),u/2,S/2),i.restore()}function v(){let i=r.frame();if(!i)return;let u=i.air||r.airNow,S=u?.aqi,h=ze(S);t("a-cat").textContent=h.name,t("a-cat").style.color=h.color,t("a-note").textContent=b(S);let d=null;if(u)for(let T of pn){let M=u[T.key];if(M==null)continue;let $=M/T.ref;(!d||$>d.frac)&&(d={...T,value:M,frac:$})}t("a-dl").innerHTML=`
      ${y("Dominant",d?`${d.label} ${d.value.toFixed(1)} ${d.unit}`:"\u2014")}
      ${y("PM2.5",u?.pm25!=null?`${u.pm25.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
      ${y("Ozone",u?.o3!=null?`${u.o3.toFixed(0)} \xB5g/m\xB3`:"\u2014")}
      ${y("Aerosol depth",u?.aod!=null?u.aod.toFixed(3):"\u2014")}
      ${y("Dust",u?.dust!=null?`${u.dust.toFixed(1)} \xB5g/m\xB3`:"\u2014")}
    `,t("a-poll").innerHTML=pn.map(T=>{let M=u?.[T.key];if(M==null)return"";let $=H(M/T.ref*100,0,100),k=M>T.who,A=$>100?R.crit:$>66?R.serious:$>33?R.warn:R.good;return`
        <div style="margin-bottom:7px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
            <span class="lbl" style="color:var(--dim)">${T.label}</span>
            <span class="num" style="font-size:max(.72rem,var(--fs-floor,0px));color:${A}">${M.toFixed(M<10?1:0)}<span style="color:var(--faint);font-size:max(.85em,var(--fs-floor,0px))"> ${T.unit}</span></span>
          </div>
          <div class="meter" style="--ac:${A};margin:3px 0 2px;position:relative">
            <i style="width:${$}%"></i>
            <span style="position:absolute;left:${H(T.who/T.ref*100,0,100)}%;top:-2px;bottom:-2px;width:1px;background:rgba(255,255,255,.5)"></span>
          </div>
          <div style="font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint)">${T.note}${k?' \xB7 <b style="color:'+R.serious+'">above WHO guideline</b>':""}</div>
        </div>`}).join("")||'<div class="nodata">no pollutant data</div>',g();let m=i.uv;t("a-uvnow").textContent=m!=null?`${m.toFixed(1)} \xB7 ${Ge(m).name}`:"\u2014";let a=i.day?.uvMax;t("a-burn").innerHTML=m>0||a>0?`
      <div class="lbl" style="margin-bottom:4px">time to burn at today's peak (UV ${(a??m).toFixed(1)})</div>
      <div class="burngrid">
        ${fa.map((T,M)=>{let $=Et(a??m,M+1),k=$==null?pe:$<15?R.crit:$<30?R.serious:$<60?R.warn:R.good;return`<div><span class="lbl">${T}</span><b style="color:${k}">${$==null?"\u2014":$+"m"}</b></div>`}).join("")}
      </div>`:'<div class="nodata">no uv exposure right now</div>';let c=qe(i.dew);t("a-cmf").textContent=c.name;let f=i.feels,p=f!=null&&i.temp!=null?f-i.temp:null;t("a-comfort").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px;margin-bottom:6px">
        <span class="num" style="font-size:1.7rem;font-weight:700;color:${c.color}">${Z.temp(i.dew)}</span>
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
        ${y("Air temperature",Z.temp(i.temp))}
        ${y("Feels like",`${Z.temp(i.feels)}${p!=null&&Math.abs(p)>=1?` (${Z.signed(p,0)}\xB0)`:""}`)}
        ${y("Relative humidity",Z.pct(i.rh))}
        ${y("Wet bulb",Z.temp(i.wetbulb))}
        ${y("Vapour deficit",i.vpd!=null?`${i.vpd.toFixed(2)} kPa`:"\u2014")}
      </dl>
      <div style="font-size:max(.56rem,var(--fs-floor,0px));color:var(--faint);line-height:1.5;margin-top:7px">
        Dew point predicts how the air feels far better than relative humidity,
        which only tells you how close the air is to saturation at its own temperature.
      </div>`,o.render(),n.render(),s.render()}function g(){let i=r.pollen,u=r.fmt;if(!i||i.source==="none"){let d=r.frame()?.air,m=d&&["grass","birch","alder","ragweed","olive","mugwort"].map(a=>[a,d[a]]).filter(([,a])=>a!=null);if(m?.length){t("a-polsrc").textContent="CAMS EUROPE",t("a-pollen").innerHTML=m.map(([a,c])=>`
          <div class="kv"><dt>${a}</dt><dd>${c.toFixed(1)} grains/m\xB3</dd></div>`).join("");return}t("a-polsrc").textContent="NO COVERAGE",t("a-pollen").innerHTML=`<div class="nodata">
        pollen data unavailable here<br><span style="color:var(--faint);text-transform:none;letter-spacing:0">
        ${te(i?.reason||"no source covers this location")}</span></div>`;return}let S=pt(i.index),h=i.yesterday!=null&&i.index!=null?i.index-i.yesterday:null;t("a-polsrc").textContent=i.source.toUpperCase(),t("a-pollen").innerHTML=`
      <div style="display:flex;align-items:baseline;gap:9px">
        <span class="num" style="font-size:1.9rem;font-weight:700;color:${S.color}">${i.index?.toFixed(1)??"--"}</span>
        <div>
          <div class="chip" style="--ac:${S.color}">${S.name}</div>
          <div style="font-size:max(.54rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">of 12${h!=null?` \xB7 ${Z.signed(h,1)} vs yesterday`:""}</div>
        </div>
      </div>
      <div class="meter" style="--ac:${S.color};margin:7px 0 9px"><i style="width:${H(i.index/12*100,0,100)}%"></i></div>
      ${i.triggers?.length?`
        <div class="lbl" style="margin-bottom:4px">today's triggers</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:9px">
          ${i.triggers.map(d=>`<span class="chip" style="--ac:var(--lm)">${te(d.name)}</span>`).join("")}
        </div>`:""}
      ${i.forecast?.length?`
        <div class="lbl" style="margin-bottom:4px">5-day outlook</div>
        <div class="pollen-fc">
          ${i.forecast.map(d=>{let m=pt(d.index);return`<div>
              <span class="bar" style="height:${H(d.index/12*100,4,100)}%;--c:${m.color}"></span>
              <b>${d.index.toFixed(1)}</b>
              <span>${u.weekday(Date.parse(d.date))}</span>
            </div>`}).join("")}
        </div>`:""}`}function b(i){return i==null?"no measurement available":i<=50?"Air quality is satisfactory. No restrictions.":i<=100?"Acceptable. Unusually sensitive people may want to limit long outdoor exertion.":i<=150?"Sensitive groups \u2014 asthma, heart or lung conditions, children, older adults \u2014 should reduce prolonged exertion.":i<=200?"Everyone may begin to feel effects. Limit prolonged outdoor exertion.":i<=300?"Health alert. Avoid outdoor exertion; keep windows closed.":"Emergency conditions. Remain indoors with filtration if possible."}let y=(i,u)=>`<div class="kv"><dt>${i}</dt><dd>${u}</dd></div>`;return{update:v,onShow(){o.render(),n.render(),s.render()}}}function vn(e){e.className="view dataview",e.innerHTML=`
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
  `;let t=h=>e.querySelector("#"+h),o=h=>ko(h,r.tz);function n(){let h=r.fmt.isoDate(Date.now()),d=r.days.find(m=>r.fmt.isoDate(m.t)===h);return d?d.t:Date.now()-12*36e5}function s(h,d,m,a){h.save(),h.font="600 11.5px 'Chakra Petch', sans-serif",h.fillStyle=se,h.textAlign="center",h.textBaseline="middle",h.letterSpacing="1.6px",h.fillText(a.toUpperCase()+" \u2026",d/2,m/2),h.restore()}let l=le(t("d2-clim"),(h,d,m,a)=>{if(!r.climate){s(h,d,m,"loading 30-year archive");return}Zo(h,d,m,a,{days:r.days.filter(c=>c.t>=n()),climate:r.climate,tf:r.fmt,doyOf:o})}),v=le(t("d2-spread"),(h,d,m,a)=>{if(!r.models){s(h,d,m,"loading model ensemble");return}xo(h,d,m,a,{rows:r.models.rows,tf:r.fmt,now:Date.now()})}),g=le(t("d2-meteo"),(h,d,m,a)=>{Ht(h,d,m,a,{hours:r.hours,days:r.days,tf:r.fmt,span:{lo:r.cursor-24*36e5,hi:r.cursor+96*36e5},cursor:r.cursor,now:Date.now(),panels:["pressure","cloud","uv","cape"]})},{onPick:({x:h,w:d})=>{let m=r.cursor-864e5,a=r.cursor+96*36e5;r.playing=!1,r.scrubTo(m+(h-4)/(d-34)*(a-m))}}),b=le(t("d2-trend"),(h,d,m,a)=>{let c=r.climate?.annual;if(!c?.length){s(h,d,m,"loading climate record");return}let f={l:4,r:34,t:16,b:18},p={x:f.l,y:f.t,w:d-f.l-f.r,h:m-f.t-f.b};if(p.w<40||p.h<30)return;let T=c.map(x=>x.mean),M=Math.min(...T)-.4,$=Math.max(...T)+.4,k=x=>p.x+x/(c.length-1)*p.w,A=x=>p.y+p.h-(x-M)/($-M)*p.h;Ce(h,p,We(M,$,Be(p.h,3)).map(x=>({v:x,y:A(x)})),x=>`${x.toFixed(1)}\xB0`);let L=T.reduce((x,ue)=>x+ue,0)/T.length,C=Math.max(2,p.w/c.length-2);c.forEach((x,ue)=>{let Re=x.mean-L,de=Re>=0?_e("#8d9aab","#f2b45a",H(Math.abs(Re)/1.6,0,1)):_e("#8d9aab","#7fb2f0",H(Math.abs(Re)/1.6,0,1)),w=A(L),I=A(x.mean);h.fillStyle=j(de,.9),h.fillRect(k(ue)-C/2,Math.min(w,I),C,Math.max(1.5,Math.abs(I-w)))});let D=c.length,N=c.reduce((x,ue)=>x+ue.year,0)/D,E=L,P=0,F=0;for(let x of c)P+=(x.year-N)*(x.mean-E),F+=(x.year-N)**2;let G=F?P/F:0,W=c.map((x,ue)=>[k(ue),A(E+G*(x.year-N))]);h.save(),h.setLineDash([5,3]),ke(h,W,G>=0?"#f2b45a":"#7fb2f0",{width:2,glow:10}),h.restore(),h.save(),h.font="500 11.5px 'JetBrains Mono', monospace",h.fillStyle=se,h.textAlign="center",h.textBaseline="top";let O=5*Rt(Math.ceil(c.length/5),p.w,h.measureText("2020").width);c.forEach((x,ue)=>{x.year%O||Oe(h,String(x.year),k(ue),m-f.b+4,0,d)}),h.restore(),h.save(),h.font="600 11.5px 'Chakra Petch', sans-serif",h.letterSpacing="1.2px";let U=`TREND ${G>=0?"+":"\u2212"}${Math.abs(G*10).toFixed(2)}\xB0F / DECADE`,ee=h.measureText(U).width;h.fillStyle=G>=0?"#f2b45a":"#7fb2f0",h.textAlign="right",h.textBaseline="top",h.fillText(U,p.x+p.w,3),h.restore(),h.save(),h.font=ye,h.letterSpacing="1.4px";let B="annual mean temperature \xB0F",q="annual mean \xB0F",ne=x=>h.measureText(x.toUpperCase()).width,J=ne(B)+ee+14<=p.w?B:ne(q)+ee+14<=p.w?q:null;if(h.restore(),J&&Me(h,p.x+2,3,J),a&&a.x>p.x&&a.x<p.x+p.w){let x=H(Math.round((a.x-p.x)/p.w*(c.length-1)),0,c.length-1),ue=c[x];h.save(),h.fillStyle="rgba(22,33,47,.94)",h.strokeStyle=j(K[0],.5);let Re=`${ue.year}  ${ue.mean.toFixed(2)}\xB0F  ${ue.mean-L>=0?"+":"\u2212"}${Math.abs(ue.mean-L).toFixed(2)} vs period mean`;h.font="500 11.5px 'JetBrains Mono', monospace";let de=h.measureText(Re).width+14,w=H(k(x)-de/2,4,Math.max(4,d-de-4)),I=a.coarse&&a.y<m/2?p.y+p.h-20:p.y+2;h.beginPath(),h.rect(w,I,de,18),h.fill(),h.stroke(),h.fillStyle=ve,h.textAlign="left",h.textBaseline="middle",h.fillText(Re,w+7,I+9),h.restore()}});function y(){let h=r.fmt,d=r.climate,m=r.dayFor(r.cursor),a=d?.doy?.[o(r.cursor)];if(t("d2-yrs").textContent=d?`${d.years} YEARS \xB7 ${d.start.slice(0,4)}\u2013${d.end.slice(0,4)}`:"\u2014",a&&m){let D=m.tmax-a.normalHigh,N=m.tmin-(a.normalLow??m.tmin),E=H((m.tmax-a.normalHigh)/Math.max(.1,a.recordHigh-a.normalHigh)*100,0,100);t("d2-rec").innerHTML=`
        <div style="font-size:max(.62rem,var(--fs-floor,0px));color:var(--dim);margin-bottom:7px">
          ${h.weekday(r.cursor)} ${h.monthDay(r.cursor)} \xB7 forecast against every
          ${h.monthDay(r.cursor)} since ${d.start.slice(0,4)}
        </div>
        <dl style="margin:0">
          ${S("Forecast high",Z.temp(m.tmax),D>=0?"#f2b45a":"#7fb2f0")}
          ${u("Normal high",`${Z.temp(a.normalHigh)}  (${Z.signed(D)}\xB0)`)}
          ${S("Record high",`${Z.temp(a.recordHigh)} in ${a.recordHighYear}`,m.tmax>=a.recordHigh?R.crit:pe)}
          ${u("Forecast low",Z.temp(m.tmin))}
          ${u("Normal low",`${Z.temp(a.normalLow)}  (${Z.signed(N)}\xB0)`)}
          ${S("Record low",`${Z.temp(a.recordLow)} in ${a.recordLowYear}`,m.tmin<=a.recordLow?K[4]:pe)}
        </dl>
        <div class="lbl" style="margin:9px 0 3px">high, normal \u2192 record</div>
        <div class="meter" style="--ac:${E>85?R.crit:R.serious}">
          <i style="width:${E}%"></i></div>
        <div style="display:flex;justify-content:space-between;font-size:max(.52rem,var(--fs-floor,0px));color:var(--faint);margin-top:2px">
          <span>${Z.temp(a.normalHigh)} normal</span><span>${Z.temp(a.recordHigh)} record</span>
        </div>
        <dl style="margin:9px 0 0">
          ${u("Historically wet",`${Math.round(a.wetFrac*100)}% of years`)}
          ${u("Mean precip",`${a.meanPrecip.toFixed(3)} in`)}
          ${u("Forecast precip",`${(m.precip??0).toFixed(2)} in`)}
        </dl>`}else t("d2-rec").innerHTML='<div class="nodata">climate archive loading\u2026</div>';let c=Date.now(),f=r.hours.filter(D=>D.t<=c&&D.t>=c-720*36e5),p=0,T=0,M=0;for(let D of r.days){if(D.tmax==null||D.tmin==null)continue;let N=(D.tmax+D.tmin)/2;D.t>c||(p+=Math.max(0,65-N),T+=Math.max(0,N-65),M+=Math.max(0,Math.min(N,86)-50))}let $=r.models?.rows?.find(D=>D.t>=c),k=$?$.spread<2?["HIGH",R.good]:$.spread<5?["MODERATE",R.warn]:$.spread<9?["LOW",R.serious]:["VERY LOW",R.crit]:null,A=r.models?.rows?.find(D=>D.t>=c+168*36e5),L=r.days.filter(D=>D.t>c).reduce((D,N)=>D+(N.precip??0),0),C=r.days.filter(D=>D.t>c&&(D.precip??0)>=.01).length;t("d2-derived").innerHTML=`
      <dl style="margin:0">
        ${u("Pressure now",`${Z.pressure(r.frame()?.pressure)} inHg`)}
        ${u("3h tendency",i())}
        ${k?S("Forecast confidence",`${k[0]} \xB7 \xB1${($.spread/2).toFixed(1)}\xB0`,k[1]):""}
        ${A?u("Day-7 model spread",`${A.spread.toFixed(1)}\xB0`):""}
        ${u("16-day precip total",`${L.toFixed(2)} in`)}
        ${u("Wet days ahead",`${C} of ${r.days.filter(D=>D.t>c).length}`)}
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
      </div>`,l.render(),v.render(),b.render(),g.render()}function i(){let h=r.cursor,d=r.hours.find(f=>f.t>=h-3*36e5),m=r.hours.find(f=>f.t>=h);if(!d?.pressure||!m?.pressure)return"\u2014";let a=(m.pressure-d.pressure)*.029529983,c=Math.abs(a)<.02?"steady":Math.abs(a)<.06?"slow":Math.abs(a)<.12?"moderate":"rapid";return`${Z.signed(a,3)} inHg \xB7 ${a>0?"rising":a<0?"falling":""} ${c}`.trim()}let u=(h,d)=>`<div class="kv"><dt>${h}</dt><dd>${d}</dd></div>`,S=(h,d,m)=>`<div class="kv"><dt>${h}</dt><dd style="color:${m}">${d}</dd></div>`;return{update:y,onShow(){l.render(),v.render(),b.render(),g.render()}}}var nt=null,ma=()=>nt?Promise.resolve(nt):import("./sats.OZS22OPN.js").then(e=>nt=e),yn=1852,pa=1e4,wn=24,bn="atmos.sats.v1",ga=5e3,Mn=2,Sn=(e,t)=>t?se:_e("#f07aa6","#3fd0d8",H((e??0)/38e3,0,1));function $n(e){e.className="view overheadview",e.innerHTML=`
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
  `;let t=w=>e.querySelector("#"+w),o=[],n=0,s=null,l=null,v=null,g=null,b=null,y=!1,i=Object.fromEntries(Ie.map(w=>[w.key,w.on]));try{let w=JSON.parse(localStorage.getItem(bn)||"null");if(w&&typeof w=="object")for(let I of Ie)typeof w[I.key]=="boolean"&&(i[I.key]=w[I.key])}catch{}let u={},S=[],h=null,d=0,m=null,a=[],c=()=>r.loc||{lat:0,lon:0},f=new ct(t("o-map"),{center:[c().lat,c().lon],zoom:9,minZoom:5,maxZoom:12,onTap:w=>p(w)});f.layers=[{name:"base",url:(w,I,V)=>`${ut}/World_Dark_Gray_Base/MapServer/tile/${w}/${V}/${I}`,filter:jt,opacity:1},{name:"labels",url:(w,I,V)=>`${ut}/World_Dark_Gray_Reference/MapServer/tile/${w}/${V}/${I}`,filter:Kt,opacity:.85}],f.overlays.push((w,I)=>{let V=c(),[z,_]=I.project(V.lat,V.lon),Y=156543.03392*Math.cos(I.lat*Math.PI/180)/Math.pow(2,I.zoom);w.save(),w.strokeStyle="rgba(63,208,216,.13)",w.setLineDash([2,4]),w.lineWidth=1,w.font="500 11.5px 'JetBrains Mono', monospace",w.fillStyle=K[0],w.textAlign="center",w.textBaseline="bottom";for(let Q of[10,20,40]){let X=Q*yn/Y;X<24||X>Math.max(I.w,I.h)||(w.beginPath(),w.arc(z,_,X,0,Math.PI*2),w.stroke(),Ae(w,`${Q} NM`,z,_-X-2))}w.restore();for(let Q of y?[]:o){let[X,oe]=I.project(Q.lat,Q.lon);if(X<-20||oe<-20||X>I.w+20||oe>I.h+20)continue;let fe=Q.hex===l,Se=Sn(Q.alt,Q.gnd);if(fe){let Le=(Q.gs??0)/60;if(Le>.1&&Q.trk!=null){let yo=Le*yn/Y,wo=(Q.trk-90)*Math.PI/180;w.save(),w.strokeStyle=j(Se,.6),w.setLineDash([3,3]),w.lineWidth=1.2,w.beginPath(),w.moveTo(X,oe),w.lineTo(X+Math.cos(wo)*yo,oe+Math.sin(wo)*yo),w.stroke(),w.restore()}w.save(),w.strokeStyle=Se,w.lineWidth=1.5,w.shadowColor=Se,w.shadowBlur=5,w.beginPath(),w.arc(X,oe,13,0,Math.PI*2),w.stroke(),w.restore()}if(w.save(),w.translate(X,oe),w.rotate((Q.trk??0)*Math.PI/180),w.fillStyle=Se,fe&&(w.shadowColor=Se,w.shadowBlur=4),w.beginPath(),w.moveTo(0,-6.5),w.lineTo(4.5,5),w.lineTo(0,2.4),w.lineTo(-4.5,5),w.closePath(),w.fill(),w.restore(),fe&&Q.cs){w.save(),w.font="600 11.5px 'Chakra Petch', sans-serif",w.letterSpacing="1.2px",w.textAlign="left",w.textBaseline="middle";let Le=w.measureText(Q.cs).width+10;w.fillStyle="rgba(22,33,47,.88)",w.fillRect(X+16,oe-7,Le,14),w.fillStyle=Se,w.fillText(Q.cs,X+21,oe),w.restore()}}y&&ee(w,I),r.loc&&Yt(w,z,_,"#f07aa6",null),xt(w,I,12,I.h-12)});function p(w){if(y){let z=null,_=wn;for(let Y of S){let[Q,X]=f.project(Y.p.lat,Y.p.lon),oe=Math.hypot(Q-w.x,X-w.y);oe<_&&(_=oe,z=Y)}B(z?z.sat.id:null);return}let I=null,V=wn;for(let z of o){let[_,Y]=f.project(z.lat,z.lon),Q=Math.hypot(_-w.x,Y-w.y);Q<V&&(V=Q,I=z)}T(I?I.hex:null)}function T(w){if(l===w||(l=w,v=null,A(),f.invalidate(),!w))return;let I=o.find(V=>V.hex===w);I&&ce.flight(I.cs||"",I.hex||"").then(V=>{l===w&&(v=V,A())}).catch(()=>{})}let M=(w,I)=>`<div class="kv"><dt>${w}</dt><dd>${I}</dd></div>`,$=w=>w==null?"\u2014":`${Math.round(w).toLocaleString()} ft`;function k(w,I){let V=c(),z=Math.PI/180,_=(I-V.lon)*z,Y=Math.sin(_)*Math.cos(w*z),Q=Math.cos(V.lat*z)*Math.sin(w*z)-Math.sin(V.lat*z)*Math.cos(w*z)*Math.cos(_);return(Fe(Math.atan2(Y,Q))+360)%360}function A(){if(y){ne();return}let w=o.find(X=>X.hex===l);if(!w){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap an aircraft on the map, or a row in NEAREST.</p>';return}t("o-cs").textContent=w.cs||w.reg||w.hex.toUpperCase();let I=w.vs==null||Math.abs(w.vs)<100?"level":w.vs>0?`climbing ${Math.round(w.vs).toLocaleString()} ft/min`:`descending ${Math.abs(Math.round(w.vs)).toLocaleString()} ft/min`,V=k(w.lat,w.lon),z=[],_=v;_?.airline?z.push(M("Operator",te(_.airline))):_?.aircraft?.owner&&z.push(M("Operator",te(_.aircraft.owner)));let Y=_?.aircraft?.manufacturer&&_?.aircraft?.type?`${_.aircraft.manufacturer} ${_.aircraft.type}`:w.type;if(Y&&z.push(M("Aircraft",te(Y))),w.reg&&z.push(M("Registration",te(w.reg))),_?.origin||_?.destination){let X=oe=>oe?`${te(oe.iata||"??")} <span class="dim">${te(oe.city||"")}</span>`:"\u2014";z.push(M("From",X(_.origin))),z.push(M("To",X(_.destination)))}z.push(M("Altitude",w.gnd?"on the ground":$(w.alt))),z.push(M("Motion",`${w.gs==null?"\u2014":`${Math.round(w.gs)} kt`} \xB7 ${I}`)),z.push(M("Heading",w.trk==null?"\u2014":`${Math.round(w.trk)}\xB0 ${me(w.trk)}`)),z.push(M("From you",`${(w.dst??0).toFixed(1)} nm ${me(V)}`));let Q=_&&!_.origin&&w.cs?'<p class="hint">No published route \u2014 usually private or general aviation.</p>':_?.origin?'<p class="hint">Route is by callsign, which airlines reuse day to day.</p>':"";t("o-sel").innerHTML=z.join("")+Q}function L(){if(y){J();return}t("o-neartitle").textContent="NEAREST";let w=o.filter(I=>!I.gnd).slice(0,8);if(t("o-src").textContent=s?s.toUpperCase():"NO FEED",!w.length){t("o-near").innerHTML='<p class="hint">Nothing in the air within range.</p>';return}t("o-near").innerHTML='<div class="oh-head"><span>callsign</span><span>type</span><span>range</span><span>alt</span></div>'+w.map(I=>`
      <button class="oh-row" data-hex="${te(I.hex)}" aria-pressed="${I.hex===l}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${Sn(I.alt,I.gnd)} 80%, var(--ink))">${te(I.cs||I.reg||I.hex)}</span>
        <span class="oh-t">${te(I.type||"")}</span>
        <span class="oh-d">${(I.dst??0).toFixed(1)} nm</span>
        <span class="oh-a">${I.alt==null?"\u2014":`${(I.alt/1e3).toFixed(1)}k`}</span>
      </button>`).join("");for(let I of t("o-near").querySelectorAll(".oh-row"))I.addEventListener("click",()=>{T(I.dataset.hex),L()})}function C(){let w=c(),I=new Date(r.cursor),V=xe(I,w.lat,w.lon),z=Ze(I,w.lat,w.lon),_=(X,oe,fe,Se)=>{let Le=oe>0;return`<div class="kv"><dt style="color:${Se}">${X}</dt><dd>${Le?`${oe.toFixed(0)}\xB0 up, ${me(fe)}`:'<span class="dim">below the horizon</span>'}</dd></div>`},Y=[_("Sun",Fe(V.altitude),He(V.azimuth),"#f2b45a"),_("Moon",Fe(z.altitude),He(z.azimuth),"#7fb2f0")];Y.push(g&&g.alt>0?_("ISS",g.alt,g.az,"#8fdc6a"):`<div class="kv"><dt style="color:#8fdc6a">ISS</dt><dd><span class="dim">${g?`below the horizon, ${g.range.toLocaleString()} km away`:"no fix"}</span></dd></div>`);let Q=Math.abs(r.cursor-Date.now());t("o-lookwhen").textContent=Q<6*6e4?"NOW":`${r.fmt.weekday(r.cursor)} ${r.fmt.hm(r.cursor)}`,t("o-sky").innerHTML=Y.join("")+'<p class="hint">Aircraft positions from adsb.lol under ODbL; routes and airframes from adsbdb. Both are run by volunteers.</p>'}function D(){if(y){x();return}let w=o.filter(V=>!V.gnd).length;t("o-count").textContent=`${w} AIRCRAFT`;let I=n?Math.round((Date.now()-n)/1e3):null;t("o-age").textContent=I==null?"\u2014":I<20?"LIVE":`${I}s AGO`}async function N(){if(!(y||r.view!=="overhead"||!r.loc))try{let w=await ce.aircraft(r.loc.lat,r.loc.lon,60);o=w.aircraft||[],n=w.at||Date.now(),s=w.source,l&&!o.some(I=>I.hex===l)&&T(null),D(),L(),A(),f.invalidate()}catch{}}async function E(){if(!(r.view!=="overhead"||!r.loc))try{let w=await ce.iss();if(w.pos?.ok){let I=w.pos.data;g=mt(r.loc.lat,r.loc.lon,I.latitude,I.longitude,I.altitude),C()}}catch{}}let P=w=>Ie.find(I=>I.key===w),F=w=>`${w.lat.toFixed(1)},${w.lon.toFixed(1)}`,G=w=>w<1?`${Math.max(1,Math.round(w*60))} min`:w<48?`${Math.round(w)} h`:`${Math.round(w/24)} days`;async function W(w){let I=u[w.key];if(!(I&&(I.state==="ok"||I.state==="loading"))){u[w.key]={state:"loading",sats:[],fetched:null};try{await ma();let V=new Map,z=1/0;for(let _ of w.groups){let Y=await fetch(new URL(`/sats/${_}.json`,location.origin));if(!Y.ok)throw new Error(`${_} -> ${Y.status}`);let Q=await Y.json(),X=Date.parse(Q.fetched);Number.isFinite(X)&&(z=Math.min(z,X));for(let oe of nt.prepare(Q.records,w.key))V.set(oe.id,oe)}if(!V.size)throw new Error("empty");u[w.key]={state:"ok",sats:[...V.values()],fetched:Number.isFinite(z)?z:null}}catch{u[w.key]={state:"fail",sats:[],fetched:null}}U(!0),ue(),L(),A(),D(),f.invalidate()}}let O={};function U(w){if(!y)return;let I=r.cursor,V=c(),z=[];for(let Y of Ie){let Q=u[Y.key];if(!i[Y.key]||!Q||Q.state!=="ok")continue;let X=O[Y.key],oe=Y.key==="starlink";if(!w&&oe&&X&&Math.abs(I-X.at)<ga){z.push(...X.list);continue}let fe=[];for(let Se of Q.sats){let Le=nt.positionAt(Se,I);Le&&fe.push({sat:Se,p:Le,cat:Y,look:mt(V.lat,V.lon,Le.lat,Le.lon,Le.altKm)})}O[Y.key]={at:I,list:fe},z.push(...fe)}S=z;let _=S.find(Y=>Y.sat.id===h);a=_?nt.groundTrack(_.sat,I,90,60):[]}function ee(w,I){let V=256*Math.pow(2,I.zoom),z=S.find(_=>_.sat.id===h);for(let _ of[-V,0,V]){if(z&&a.length){w.save(),w.strokeStyle=j(z.cat.colour,.7),w.setLineDash([4,4]),w.lineWidth=1.4;for(let Y of a)w.beginPath(),Y.forEach(([Q,X],oe)=>{let[fe,Se]=I.project(Q,X);oe?w.lineTo(fe+_,Se):w.moveTo(fe+_,Se)}),w.stroke();w.restore()}for(let Y of S){let[Q,X]=I.project(Y.p.lat,Y.p.lon),oe=Q+_;if(oe<-6||X<-6||oe>I.w+6||X>I.h+6)continue;let fe=Y.cat.key==="starlink";w.fillStyle=Y.cat.colour,w.beginPath(),w.arc(oe,X,fe?1.7:3.2,0,Math.PI*2),w.fill()}if(z){let[Y,Q]=I.project(z.p.lat,z.p.lon),X=Y+_;if(X<-40||Q<-20||X>I.w+40||Q>I.h+20)continue;w.save(),w.strokeStyle=z.cat.colour,w.lineWidth=1.5,w.shadowColor=z.cat.colour,w.shadowBlur=5,w.beginPath(),w.arc(X,Q,10,0,Math.PI*2),w.stroke(),w.restore(),w.save(),w.font="600 11.5px 'Chakra Petch', sans-serif",w.letterSpacing="1.2px",w.textAlign="left",w.textBaseline="middle";let oe=w.measureText(z.sat.name).width+10;w.fillStyle="rgba(22,33,47,.88)",w.fillRect(X+14,Q-7,oe,14),w.fillStyle=z.cat.colour,w.fillText(z.sat.name,X+19,Q),w.restore()}}}function B(w){h!==w&&(h=w,U(!1),A(),L(),f.invalidate())}let q=w=>S.filter(I=>F(I.p)===F(w.p)&&I.sat.id!==w.sat.id);function ne(){let w=S.find(fe=>fe.sat.id===h);if(!w){t("o-cs").textContent="NOTHING",t("o-sel").innerHTML='<p class="hint">Tap a dot on the map, or a row in ABOVE YOU.</p>';return}let{sat:I,p:V,look:z,cat:_}=w;t("o-cs").textContent=I.name;let Y=[M("Kind",te(kt(I.name))),M("Group",te(_.label)),M("NORAD ID",String(I.id))];I.intl&&Y.push(M("Launch",te(I.intl))),Y.push(M("Altitude",`${Math.round(V.altKm).toLocaleString()} km`)),Y.push(M("Over",`${Math.abs(V.lat).toFixed(1)}\xB0${V.lat<0?"S":"N"} ${Math.abs(V.lon).toFixed(1)}\xB0${V.lon<0?"W":"E"}`)),Y.push(M("From you",z.alt>0?`${z.alt.toFixed(0)}\xB0 up, ${me(z.az)}`:`<span class="dim">below the horizon, ${z.range.toLocaleString()} km away</span>`));let Q=nt.elementAgeHours(I,r.cursor);Y.push(M("Elements",`${Q<0?"newer than":""} ${G(Math.abs(Q))} ${Q<0?"ahead":"old"}`.trim()));let X=q(w),oe=X.length?`<p class="hint">Same orbit data, so same position: ${X.slice(0,6).map(fe=>te(fe.sat.name)).join(", ")}${X.length>6?` and ${X.length-6} more`:""}. Docked craft share the station's elements.</p>`:"";t("o-sel").innerHTML=Y.join("")+oe+'<p class="hint">Dashed line: next 90 minutes of ground track. Kind is read from the catalogue name.</p>'}function J(){t("o-neartitle").textContent="ABOVE YOU",t("o-src").textContent="CELESTRAK";let w=new Set,I=S.filter(_=>_.look.alt>0).sort((_,Y)=>Y.look.alt-_.look.alt),V=[];for(let _ of I){let Y=F(_.p);if(!w.has(Y)&&(w.add(Y),V.push({q:_,extra:q(_).length}),V.length>=8))break}let z=Ie.some(_=>i[_.key]&&u[_.key]?.state==="ok");if(!V.length){t("o-near").innerHTML=`<p class="hint">${z?"Nothing in the chosen groups is above your horizon right now.":"Switch on a group above to see what is overhead."}</p>`;return}t("o-near").innerHTML='<div class="oh-head"><span>name</span><span>type</span><span>up</span><span>dir</span></div>'+V.map(({q:_,extra:Y})=>`
      <button class="oh-row" data-sat="${_.sat.id}" aria-pressed="${_.sat.id===h}">
        <span class="oh-cs" style="color:color-mix(in srgb, ${_.cat.colour} 80%, var(--ink))">${te(_.sat.name)}${Y?` +${Y}`:""}</span>
        <span class="oh-t">${kt(_.sat.name)==="satellite"?"":te(kt(_.sat.name))}</span>
        <span class="oh-d">${_.look.alt.toFixed(0)}\xB0</span>
        <span class="oh-a">${me(_.look.az)}</span>
      </button>`).join("");for(let _ of t("o-near").querySelectorAll(".oh-row"))_.addEventListener("click",()=>B(Number(_.dataset.sat)))}function x(){let w=Ie.filter(V=>i[V.key]&&u[V.key]?.state==="ok");t("o-count").textContent=`${S.length.toLocaleString()} SATELLITES`;let I=w.map(V=>u[V.key].fetched).filter(Boolean);t("o-age").textContent=I.length?`ELEMENTS ${G((Date.now()-Math.min(...I))/36e5).toUpperCase()} OLD`:"\u2014"}function ue(){let w=Ie.some(z=>i[z.key]&&u[z.key]?.state==="loading"),I=Ie.some(z=>i[z.key]&&u[z.key]?.state==="fail");t("o-satstate").textContent=y?w?"LOADING":I?"NO DATA":`${S.length.toLocaleString()} SHOWN`:"OFF";let V=z=>{let _=u[z.key],Y=!y||!i[z.key]?"":_?.state==="loading"?" \u2026":_?.state==="fail"?" \u2715":_?.state==="ok"?` ${_.sats.length.toLocaleString()}`:"";return`<button class="oh-chip" data-cat="${z.key}" aria-pressed="${!!i[z.key]}" style="--chip:${z.colour}">${te(z.label)}${Y}</button>`};t("o-satui").innerHTML=`
      <button class="oh-chip oh-mode" data-mode="1" aria-pressed="${y}">${y?"Back to aircraft":"Show satellites on map"}</button>
      <div class="oh-chips">${Ie.map(V).join("")}</div>
      ${I?'<p class="hint">Satellite elements are not available here. They are published to branyontech.com every two hours.</p>':""}
      ${y&&i.starlink?'<p class="hint">Starlink is thousands of objects: a large download, loaded only when on.</p>':""}
      ${y?'<p class="hint">Elements: CelesTrak. Positions computed here (SGP4).</p>':""}`}function Re(){try{localStorage.setItem(bn,JSON.stringify(i))}catch{}}function de(w){if(y!==w){if(y=w,clearInterval(m),m=null,w){T(null),f.minZoom=1;let I=c();f.setView(H(I.lat*.5,-40,40),I.lon,Mn);for(let V of Ie)i[V.key]&&W(V);r.view==="overhead"&&(m=setInterval(()=>{U(!1),x(),L(),f.invalidate()},1e3)),U(!0)}else h=null,a=[],S=[],f.minZoom=5,f.setView(c().lat,c().lon,9),N();ue(),A(),L(),D(),f.invalidate()}}return t("o-satui").addEventListener("click",w=>{let I=w.target.closest("button");if(!I)return;if(I.dataset.mode){de(!y);return}let V=P(I.dataset.cat);V&&(i[V.key]=!i[V.key],Re(),y&&i[V.key]&&W(V),U(!0),h!=null&&!S.some(z=>z.sat.id===h)&&(h=null),ue(),A(),L(),D(),f.invalidate())}),t("o-center").addEventListener("click",()=>{r.loc&&(y?f.setView(H(r.loc.lat*.5,-40,40),r.loc.lon,Mn):f.setView(r.loc.lat,r.loc.lon,9))}),t("o-zin").addEventListener("click",()=>f.setView(f.lat,f.lon,f.zoom+1)),t("o-zout").addEventListener("click",()=>f.setView(f.lat,f.lon,f.zoom-1)),r.on("loc",()=>{if(r.loc){if(y){U(!0),L(),f.invalidate(),E();return}f.setView(r.loc.lat,r.loc.lon,9),N(),E()}}),A(),C(),ue(),r.on("cursor",()=>{r.view==="overhead"&&(C(),y&&(U(!1),A(),L(),f.invalidate()))}),{map:f,update(){C(),f.invalidate()},onShow(){f.resize(),N(),E(),clearInterval(b),b=setInterval(()=>{N(),D()},pa),y&&!m&&(m=setInterval(()=>{U(!1),x(),L(),f.invalidate()},1e3))},onHide(){clearInterval(b),b=null,clearInterval(m),m=null}}}var re=null,Ue=null,Zt=!1,De=null,va=0,bt=1/0;function kn(e,t=4){let o=e.createBuffer(1,e.sampleRate*t,e.sampleRate),n=o.getChannelData(0);for(let s=0;s<n.length;s++)n[s]=Math.random()*2-1;return o}function ho(e,t,{type:o,freq:n,q:s,gain:l}){let v=e.createBufferSource();v.buffer=kn(e),v.loop=!0;let g=e.createBiquadFilter();g.type=o,g.frequency.value=n,g.Q.value=s;let b=e.createGain();return b.gain.value=l,v.connect(g).connect(b).connect(t),v.start(),{src:v,filt:g,gain:b}}function Tn(){if(re)return;let e=window.AudioContext||window.webkitAudioContext;if(!e)return;re=new e,Ue=re.createGain(),Ue.gain.value=0;let t=re.createDynamicsCompressor();t.threshold.value=-18,t.ratio.value=6,t.attack.value=.004,t.release.value=.25,Ue.connect(t).connect(re.destination);let o=ho(re,Ue,{type:"bandpass",freq:1400,q:.7,gain:0}),n=ho(re,Ue,{type:"highpass",freq:4200,q:.5,gain:0}),s=ho(re,Ue,{type:"bandpass",freq:420,q:1.6,gain:0}),l=re.createOscillator(),v=re.createGain();l.frequency.value=.07,v.gain.value=180,l.connect(v).connect(s.filt.frequency),l.start();let g=re.createGain();g.gain.value=0;let b=re.createBiquadFilter();b.type="lowpass",b.frequency.value=480,b.Q.value=.6,b.connect(g).connect(Ue);let y=[0,3.5].map(i=>{let u=re.createOscillator();u.type="sawtooth",u.frequency.value=55,u.detune.value=i;let S=re.createGain();return S.gain.value=.22,u.connect(S).connect(b),u.start(),u});De={rain:o,patter:n,wind:s,drone:{oscs:y,gain:g,filt:b},lfo:l,lfoGain:v}}function at(){return Zt}function En(e){Zt=e,re&&(e&&re.state==="suspended"&&re.resume(),Ke(Ue.gain,e?.5:0,e?1.2:.6))}var Ke=(e,t,o=.6)=>{let n=re.currentTime;e.cancelScheduledValues(n),e.setValueAtTime(e.value,n),e.linearRampToValueAtTime(t,n+o)};function ya(e=.5){if(!re||!Zt)return;let t=re.currentTime,o=re.createBufferSource();o.buffer=kn(re,3);let n=re.createBiquadFilter();n.type="lowpass",n.frequency.setValueAtTime(700-e*480,t),n.Q.value=.5;let s=re.createGain(),l=.55*(1-e*.65);s.gain.setValueAtTime(1e-4,t),s.gain.exponentialRampToValueAtTime(Math.max(.02,l),t+.04+e*.3),s.gain.exponentialRampToValueAtTime(1e-4,t+1.6+e*2.4),o.connect(n).connect(s).connect(Ue),o.start(t),o.stop(t+4.2)}function An(e){if(!re||!Zt||!De)return;let t=e.frame();if(!t)return;let o=t.wx.kind,n=Math.min(1,Math.max((t.precip??0)/.1,o==="rain"||o==="storm"?t.wx.intensity*.5:0)),s=Math.min(1,(t.wind??0)/32),l=Math.min(1,((t.gust??t.wind??0)-(t.wind??0))/18);Ke(De.rain.gain.gain,n*.3,.9),Ke(De.rain.filt.frequency,900+n*1500,.9),Ke(De.patter.gain.gain,n*n*.1,.9),Ke(De.wind.gain.gain,s*.24,1.1),Ke(De.wind.filt.Q,1.2+l*2.5,1.1),De.lfo.frequency.value=.05+l*.22,De.lfoGain.gain.value=120+l*420;let v=t.temp??60,g=44+Math.max(0,Math.min(1,(v-20)/80))*26;for(let i of De.drone.oscs)i.frequency.setTargetAtTime(g,re.currentTime,1.5);Ke(De.drone.gain.gain,.055+(t.sun.altDeg>0?.02:.05),2),Ke(De.drone.filt.frequency,300+Math.max(0,t.sun.altDeg)*9,2);let b=o==="storm"?.9:Math.min(.6,(t.cape??0)/2500),y=performance.now();b>.15?(bt===1/0&&(bt=y+Math.random()*6e3),y>bt&&(ya(Math.random()*(1-b*.6)),bt=y+3e3+Math.random()*22e3*(1.1-b))):bt=1/0,va=b}function wa(e){let t=e.fmt,o=e.frame(Date.now());if(!o)return[];let n=[],s=o.day,l=Date.now();n.push({tone:"lead",text:`${t.full(l)}. It is ${Z.temp(o.temp)} and ${o.wx.long.toLowerCase()} in ${e.loc.name}`+(Math.abs((o.feels??o.temp)-o.temp)>=3?`, feeling like ${Z.temp(o.feels)}`:"")+"."});for(let m of e.alerts.slice(0,3))n.push({tone:"alert",text:`${m.event} in effect until ${t.weekday(m.expires)} ${t.hm12(m.expires)}.`+(m.instruction?` ${ba(m.instruction)}`:"")});if(s){let m=e.climate?.doy?.[Ma(e,l)],a=`Today runs ${Z.temp(s.tmin)} to ${Z.temp(s.tmax)}`;if(m){let c=s.tmax-m.normalHigh;Math.abs(c)>=3?a+=`, ${Math.abs(c).toFixed(0)}\xB0 ${c>0?"above":"below"} the normal high of ${Z.temp(m.normalHigh)}`:a+=", right about normal",s.tmax>=m.recordHigh&&(a+=`. That would tie or beat the record of ${Z.temp(m.recordHigh)} set in ${m.recordHighYear}`)}n.push({tone:"body",text:a+"."})}let v=yt(e);if(v?.raining)n.push({tone:"wet",text:v.minutes!=null?`It is raining now and should ease within ${v.minutes} minutes.`:"It is raining now, with no break in the next six hours."});else if(v?.minutes!=null&&v.minutes<=240)n.push({tone:"wet",text:`Rain arrives in about ${v.minutes} minutes, around ${t.hm12(v.changeAt)}.`});else{let m=e.hours.find(a=>a.t>l&&(a.pop??0)>=40);m?n.push({tone:"body",text:`Dry for now. The next real chance of rain is ${t.weekday(m.t)} around ${t.hm12(m.t)}, at ${Math.round(m.pop)} percent.`}):n.push({tone:"body",text:"No meaningful rain anywhere in the sixteen-day window."})}let g=Math.max(...e.hours.filter(m=>m.t>l&&m.t<l+24*36e5).map(m=>m.gust??0),0);g>=22&&n.push({tone:"warn",text:`Wind is worth planning around: gusts reach ${Math.round(g)} miles per hour today, ${Lt(g).effect}.`});let b=qe(o.dew);["STICKY","HUMID","OPPRESSIVE","MISERABLE","LETHAL"].includes(b.name)?n.push({tone:"warn",text:`The air is ${b.name.toLowerCase()} \u2014 dew point ${Z.temp(o.dew)}, ${b.note}.`}):b.name==="VERY DRY"&&n.push({tone:"body",text:`Very dry air, dew point ${Z.temp(o.dew)}. Expect static and chapped lips.`});let y=s?.uvMax;if(y!=null&&y>=6){let m=Math.round(350/(y*15));n.push({tone:"warn",text:`UV peaks at ${y.toFixed(1)}, ${Ge(y).name.toLowerCase()}. Unprotected skin burns in roughly ${m} minutes.`})}let i=o.air?.aqi??e.airNow?.aqi;i!=null&&i>75&&n.push({tone:"warn",text:`Air quality is ${ze(i).name.toLowerCase()} at ${Math.round(i)} on the US index.`});let u=e.pollen;if(u?.index!=null&&u.index>=7){let m=(u.triggers||[]).map(a=>a.name).slice(0,3).join(", ");n.push({tone:"warn",text:`Pollen is ${pt(u.index).name.toLowerCase().replace("-"," to ")} at ${u.index.toFixed(1)} of 12${m?`, driven by ${m}`:""}.`})}let S=_t.map(m=>({k:m,w:Ut(m,e,{hours:24,limit:1,minScore:62})[0]})).filter(m=>m.w).sort((m,a)=>a.w.peak-m.w.peak).slice(0,2);for(let m of S){let a=Bt(m.k);n.push({tone:"good",text:`Best window to ${a.label.toLowerCase()}: ${t.weekday(m.w.start)} ${t.hm12(m.w.start)} to ${t.hm12(m.w.end)}, scoring ${m.w.peak} out of 100.`})}let h=e.currentKp();if(h!=null&&h>=5){let m=At(h);n.push({tone:"space",text:`Geomagnetic activity is elevated: Kp ${h.toFixed(1)}, ${m.name}. Aurora may be visible to about ${m.lat} degrees latitude.`})}let d=e.sunTimesFor(l);return n.push({tone:"body",text:`Sunset is at ${t.hm12(d.sunset)}, with golden hour beginning ${t.hm12(d.goldenHour)}`+(s?.daylight?` and ${st(s.daylight)} of daylight today`:"")+"."}),n}var ba=e=>{let t=String(e).replace(/\s+/g," ").match(/^.{0,180}?[.!?](\s|$)/);return(t?t[0]:String(e).slice(0,180)).trim()};function Ma(e,t){let[,o,n]=e.fmt.isoDate(t).split("-").map(Number);return[0,31,60,91,121,152,182,213,244,274,305,335][o-1]+n-1}var Sa={lead:"var(--cy)",alert:"var(--rd)",warn:"var(--am)",wet:"var(--ice)",good:"var(--lm)",space:"var(--vi)",body:"var(--ink)"};function fo(e,t){let o=wa(e);t(`
    <div class="hd">BRIEFING<span class="rule"></span>
      <span class="val">${te(e.loc.name.toUpperCase())} \xB7 ${e.fmt.hm(Date.now())}</span></div>
    <div class="res-list" style="max-height:60vh">
      ${o.map((n,s)=>`
        <p style="
          margin:0 0 10px;
          font-size:${s===0?".92rem":".8rem"};
          line-height:1.6;
          color:${Sa[n.tone]||"var(--ink)"};
          ${n.tone==="alert"?"border-left:2px solid var(--rd);padding-left:10px;":""}
          ${s===0?"font-weight:600;":""}
        ">${te(n.text)}</p>`).join("")}
    </div>
    <div style="display:flex;gap:6px;margin-top:12px">
      <button class="tl-btn" id="speakBtn">\u25B6 SPEAK</button>
      <button class="tl-btn" id="stopBtn">\u25A0 STOP</button>
    </div>
  `,n=>{let s=()=>{if(!window.speechSynthesis)return;speechSynthesis.cancel();let l=o.map(b=>b.text).join(" "),v=new SpeechSynthesisUtterance(l);v.rate=1.02,v.pitch=.85;let g=speechSynthesis.getVoices().find(b=>/en[-_](GB|US)/.test(b.lang)&&b.localService);g&&(v.voice=g),speechSynthesis.speak(v)};n.querySelector("#speakBtn").addEventListener("click",s),n.querySelector("#stopBtn").addEventListener("click",()=>speechSynthesis?.cancel()),e.settings.voice&&setTimeout(s,220)})}function Ln(e,t,o){let n=t.ownerDocument,s='a[href], button, input, select, textarea, summary, [tabindex], [contenteditable="true"]',l=null,v=!1,g=()=>[...t.querySelectorAll(s)].filter(h=>h.tabIndex>=0&&!h.matches(":disabled")&&!h.closest("[hidden], [inert]")&&h.getClientRects().length&&n.defaultView.getComputedStyle(h).visibility!=="hidden").sort((h,d)=>(h.tabIndex||1/0)-(d.tabIndex||1/0)),b=()=>(g()[0]||t).focus();function y(h){!e.hidden&&!t.contains(h.target)&&b()}function i(h){if(e.hidden||h.defaultPrevented||h.isComposing)return;if(h.key==="Escape"){h.preventDefault(),h.stopPropagation(),S();return}if(h.key!=="Tab"||h.ctrlKey||h.metaKey||h.altKey)return;let d=g(),m=d[0],a=d.at(-1);m?(!d.includes(n.activeElement)||(h.shiftKey?n.activeElement===m:n.activeElement===a))&&(h.preventDefault(),(h.shiftKey?a:m).focus()):(h.preventDefault(),t.focus({preventScroll:!0}))}function u(h,d,m){e.hidden&&(l=m||n.activeElement,v=o?.inert||!1,o&&(o.inert=!0),n.addEventListener("keydown",i,!0),n.addEventListener("focusin",y)),t.innerHTML=h;let a=t.querySelector(".hd");a?(a.id||="modalTitle",t.setAttribute("aria-labelledby",a.id),t.removeAttribute("aria-label")):(t.removeAttribute("aria-labelledby"),t.setAttribute("aria-label","Weather dialog")),e.hidden=!1,e.scrollTop=t.scrollTop=0,d&&d(t),t.contains(n.activeElement)||b()}function S(){if(e.hidden)return;e.hidden=!0,n.removeEventListener("keydown",i,!0),n.removeEventListener("focusin",y),t.innerHTML="",o&&(o.inert=v);let h=l;l=null,h?.isConnected&&!h.closest("[inert]")&&h.focus({preventScroll:!0})}return e.addEventListener("click",h=>{h.target===e&&S()}),{open:u,close:S}}var go=["deck","radar","sky","air","data","overhead"],$a=5*6e4,he={sky:document.getElementById("sky"),boot:document.getElementById("boot"),bootLog:document.getElementById("bootLog"),led:document.getElementById("led"),locBtn:document.getElementById("locBtn"),locName:document.getElementById("locName"),locSub:document.getElementById("locSub"),nav:document.getElementById("nav"),clockTime:document.getElementById("clockTime"),clockZone:document.getElementById("clockZone"),alertBtn:document.getElementById("alertBtn"),soundBtn:document.getElementById("soundBtn"),briefBtn:document.getElementById("briefBtn"),cfgBtn:document.getElementById("cfgBtn"),scrub:document.getElementById("scrub"),modal:document.getElementById("modal"),modalCard:document.getElementById("modalCard")},Ye=new Pt(he.sky),On=null,Ne={},Rn=Ln(he.modal,he.modalCard,document.getElementById("app")),Cn=[];function Te(e,t=""){Cn.push(t?`<span class="${t}">${e}</span>`:e),he.bootLog.innerHTML=Cn.join(`
`)}async function ka(){Te("ATMOS//NET v1.0.0"),Te('<span class="mut">initialising atmospheric console\u2026</span>'),Ro();let e=new URLSearchParams(location.search).get("q");e!==null&&/^[0-3]$/.test(e)&&ro(+e),Te(`render tier ${ae.tier} \xB7 ${ae.onBattery?"battery":"AC power"}`,"ok");let t=Ye.init();Ye.setQuality(ae.tier),Te(t?"webgl2 sky renderer online":"webgl2 unavailable \u2014 sky disabled",t?"ok":"err"),ae.onChange(l=>Ye.setQuality(l));let o=r.loc,n=null;o?Te(`location: ${te(o.name)}`):(n=await ce.config(),o=n.home,Te(`no saved location \u2014 using ${te(o.name)}`)),Te('<span class="mut">contacting feeds\u2026</span>'),await r.setLocation(o,{remember:!n?.public});let s=r.raw;Te(`open-meteo forecast  ${s?.forecast?.ok?"OK":"FAIL"}`,s?.forecast?.ok?"ok":"err"),Te(`open-meteo air       ${s?.air?.ok?"OK":"FAIL"}`,s?.air?.ok?"ok":"err"),Te(`nws alerts           ${s?.alerts?.ok?"OK":"FAIL"}`,s?.alerts?.ok?"ok":"err"),Te(`noaa swpc space wx   ${s?.space?.ok?"OK":"FAIL"}`,s?.space?.ok?"ok":"err"),Te(`${r.hours.length} hourly steps \xB7 ${r.days.length} days \xB7 ${r.min15.length} 15-min steps`,"ok"),Ta(),Te("console ready","ok"),setTimeout(()=>{he.boot.classList.add("done");let l=r.skyParams();l&&Ye.snap(l)},0),Nn(),setInterval(()=>{document.hidden||r.refresh()},$a),La(n)}function Dn(e,t,o){Object.defineProperty(Ne,e,{configurable:!0,enumerable:!0,get(){let n=t(document.getElementById(o));return Object.defineProperty(Ne,e,{value:n,configurable:!0,enumerable:!0,writable:!0}),n}})}function Ta(){On=Ko(he.scrub),Ne.deck=rn(document.getElementById("view-deck")),Ne.sky=mn(document.getElementById("view-sky")),Ne.air=gn(document.getElementById("view-air")),Ne.data=vn(document.getElementById("view-data")),Dn("radar",cn,"view-radar"),Dn("overhead",$n,"view-overhead");let e=()=>{let o=Ne[r.view];o?.update&&o.update()};r.on("data",()=>{e(),mo()}),r.on("cursor",()=>{e(),St()}),r.on("climate",e),r.on("models",e),r.on("pollen",e),r.on("observed",e),r.on("radar",e),r.on("loc",mo),r.on("status",o=>{he.led.dataset.state=o==="ok"?"":o}),he.nav.addEventListener("click",o=>{let n=o.target.closest("button[data-view]");n&&Mt(n.dataset.view)}),he.locBtn.addEventListener("click",Hn),he.alertBtn.addEventListener("click",Fn),he.briefBtn.addEventListener("click",()=>fo(r,ft)),he.cfgBtn.addEventListener("click",zn),he.soundBtn.addEventListener("click",vo),document.addEventListener("visibilitychange",()=>{document.hidden||(Jt=0,r.syncToNow())}),window.addEventListener("resize",()=>{Ye.resize()}),document.addEventListener("keydown",Ca),window.addEventListener("hashchange",()=>Mt(location.hash.slice(1),{push:!1}));let t=location.hash.slice(1);go.includes(t)&&t!=="deck"?Mt(t):document.documentElement.style.setProperty("--stage-dim","0.25"),mo(),e()}function mo(){let e=r.loc;e&&(he.locName.textContent=e.name,he.locSub.textContent=[e.admin1,e.country].filter(Boolean).join(" \xB7 ")||`${e.lat.toFixed(2)}, ${e.lon.toFixed(2)}`),he.clockZone.textContent=r.tz.split("/").pop().replace(/_/g," "),he.alertBtn.dataset.n=String(r.alerts.length),he.soundBtn.classList.toggle("on",at())}function Mt(e,{push:t=!0}={}){if(!go.includes(e)||r.view===e)return;Ne[r.view]?.onHide?.(),r.view=e,_o();let o=Ne[e];t&&location.hash.slice(1)!==e&&history.replaceState(null,"","#"+e);for(let n of he.nav.querySelectorAll("button"))n.setAttribute("aria-selected",String(n.dataset.view===e));for(let n of document.querySelectorAll(".view"))n.classList.toggle("active",n.dataset.view===e);document.documentElement.style.setProperty("--stage-dim",e==="deck"?"0.25":"0.72"),o?.update&&o.update(),o?.onShow&&o.onShow()}var In=performance.now(),po=0,Jt=0,Ea=20;function Nn(e=performance.now()){requestAnimationFrame(Nn);let t=Math.min(.1,(e-In)/1e3);In=e,Oo(t),document.hidden||(Ye.render(e,t),On?.tick(t),Jt+=t,Jt>Ea&&(Jt=0,r.syncToNow()),po+=t,(r.playing||po>.25)&&(po=0,St()),Aa(e),An(r))}function St(){let e=r.skyParams();e&&Ye.set(e)}var Pn=0;function Aa(e){e-Pn<500||(Pn=e,he.clockTime.textContent=r.fmt.hms(Date.now()))}function ft(e,t,o){Rn.open(e,t,o)}function Qt(){Rn.close()}function Hn(){ft(`
    <div class="hd">LOCATION<span class="rule"></span><span class="val">ENTER TO SELECT \xB7 ESC TO CLOSE</span></div>
    <input class="search-input" id="q" placeholder="search any city, or paste  lat, lon" autocomplete="off" spellcheck="false">
    <button class="tl-btn" id="useloc" style="margin-top:8px">\u25CE USE MY LOCATION</button>
    <div class="res-list" id="res"></div>
  `,e=>{let t=e.querySelector("#q"),o=e.querySelector("#res"),n=[],s=0,l=null,v=()=>{n=r.favorites.map(i=>({...i,fav:!0})),g("SAVED")},g=i=>{if(!n.length){o.innerHTML=`<h3>${i}</h3><div class="nodata">no results</div>`;return}o.innerHTML=`<h3>${i}</h3>`+n.map((u,S)=>`
        <div class="res-item ${S===s?"sel":""}" data-i="${S}">
          <div>
            <b>${ht(u.name)}</b><br>
            <span>${ht([u.admin1,u.country||u.country_code].filter(Boolean).join(" \xB7 "))}</span>
          </div>
          <span class="coord">${(+u.latitude).toFixed(2)}, ${(+u.longitude).toFixed(2)}</span>
          ${u.fav?`<button class="rm" data-rm="${S}" title="Remove">\xD7</button>`:""}
        </div>`).join("")},b=async i=>{let u=n[i];u&&(r.addFavorite(u),Qt(),await r.setLocation(u),St())};o.addEventListener("click",i=>{let u=i.target.closest("[data-rm]");if(u){i.stopPropagation(),r.removeFavorite(+u.dataset.rm),v();return}let S=i.target.closest("[data-i]");S&&b(+S.dataset.i)}),t.addEventListener("input",()=>{clearTimeout(l);let i=t.value.trim();if(!i){v();return}let u=i.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);if(u){let S=+u[1],h=+u[2];if(Math.abs(S)<=90&&Math.abs(h)<=180){n=[{name:`${S.toFixed(4)}, ${h.toFixed(4)}`,admin1:"coordinate",latitude:S,longitude:h}],s=0,g("COORDINATE");return}}l=setTimeout(async()=>{try{n=(await ce.geocode(i)).results||[],s=0,g("RESULTS")}catch{n=[],g("RESULTS")}},220)}),t.addEventListener("keydown",i=>{i.key==="ArrowDown"?(s=Math.min(n.length-1,s+1),g(o.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="ArrowUp"?(s=Math.max(0,s-1),g(o.querySelector("h3")?.textContent||""),i.preventDefault()):i.key==="Enter"&&(b(s),i.preventDefault())});let y=e.querySelector("#useloc");!navigator.geolocation||!window.isSecureContext?y.remove():y.addEventListener("click",()=>{y.textContent="\u25CE LOCATING\u2026",navigator.geolocation.getCurrentPosition(async i=>{let u=i.coords.latitude,S=i.coords.longitude,h=`${u.toFixed(2)}, ${S.toFixed(2)}`,d="",m="";try{let a=await ce.reverse(u,S);h=a.city||a.locality||a.principalSubdivision||h,d=a.principalSubdivision||"",m=a.countryCode||""}catch{}r.settings.geo="set",Qt(),await r.setLocation({name:h,admin1:d,country_code:m,latitude:u,longitude:S}),St()},i=>{y.textContent=i.code===i.PERMISSION_DENIED?"\u25CE LOCATION BLOCKED IN BROWSER":"\u25CE LOCATION UNAVAILABLE"},{timeout:8e3,maximumAge:30*6e4})}),v(),t.focus()})}function Fn(){let e=r.alerts;if(!e.length){ft(`<div class="hd">ALERTS<span class="rule"></span></div>
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
  `)}function zn(e){let t=ae.manual;ft(`
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
  `,o=>{o.querySelector("#qseg").addEventListener("click",n=>{let s=n.target.closest("[data-q]");s&&(ro(s.dataset.q==="auto"?null:+s.dataset.q),o.querySelectorAll("[data-q]").forEach(l=>l.classList.toggle("on",l===s)))}),o.querySelector("#sndT").addEventListener("click",n=>{vo(),n.target.textContent=at()?"on":"off",n.target.classList.toggle("on",at())}),o.querySelector("#voiceT").addEventListener("click",n=>{r.settings.voice=!r.settings.voice,r.save(),n.target.textContent=r.settings.voice?"on":"off",n.target.classList.toggle("on",r.settings.voice)})},e?.currentTarget)}function vo(){let e=!at();Tn(),En(e),r.settings.sound=e,r.save(),he.soundBtn.classList.toggle("on",e)}function La(e){e?.public&&(r.settings.geo||!navigator.geolocation||!window.isSecureContext||navigator.geolocation.getCurrentPosition(async t=>{let o=t.coords.latitude,n=t.coords.longitude,s=`${o.toFixed(2)}, ${n.toFixed(2)}`,l="",v="";try{let g=await ce.reverse(o,n);s=g.city||g.locality||g.principalSubdivision||s,l=g.principalSubdivision||"",v=g.countryCode||""}catch{}r.settings.geo="set",await r.setLocation({name:s,admin1:l,country_code:v,latitude:o,longitude:n}),St()},t=>{t.code===t.PERMISSION_DENIED&&(r.settings.geo="denied",r.save())},{timeout:8e3,maximumAge:30*6e4,enableHighAccuracy:!1}))}function Ca(e){if(e.defaultPrevented||e.isComposing)return;if(e.target.closest?.('input, textarea, select, button, a[href], summary, [contenteditable], [role="button"], [role="link"], [role="slider"], [role="textbox"], [role="combobox"]')){e.key==="Escape"&&Qt();return}if(e.metaKey||e.ctrlKey||e.altKey||e.target.closest?.('[aria-modal="true"]'))return;let t=e.key;if(t==="Escape"){Qt();return}if(t>="1"&&t<="6"){Mt(go[+t-1]);return}switch(t.toLowerCase()){case" ":r.playing=!r.playing,r.playing&&r.view!=="radar"&&(r.following=!1),r.playing&&r.cursor>=r.span.hi-6e4&&r.setCursor(Date.now()),r.emit("play",r.playing),e.preventDefault();break;case"arrowleft":r.playing=!1,r.scrubTo(r.cursor-(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"arrowright":r.playing=!1,r.scrubTo(r.cursor+(e.shiftKey?6:1)*36e5),e.preventDefault();break;case"n":r.toNow();break;case"/":Hn(),e.preventDefault();break;case"a":Fn();break;case"b":fo(r,ft);break;case"s":vo();break;case",":zn();break;case"r":r.refresh();break;case"f":document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.();break;default:break}}var ht=te;ka().catch(e=>{console.error(e),Te(`FATAL: ${e.message}`,"err")});window.ATMOS={store:r,sky:Ye,perf:ae,setView:Mt,views:Ne};export{Qt as closeModal,ft as openModal};
