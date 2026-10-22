/** Exercise inquiry delivery states with a mocked network; never sends a submission. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/main.js'), 'utf8');

function setup(page, fetchImpl, search = '') {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const success = html.match(/data-success="([^"]+)"/)[1];
  const field = (value) => ({ value, type: 'text', validity: '', setCustomValidity(message) { this.validity = message; } });
  const name = field('Test User'), email = field('test@example.invalid'), message = field('Local mocked test');
  const interest = field('donate');
  interest.options = ['general','scholarship','donate','community-fund','volunteer','event'].map(value => ({value}));
  const fields = [name,email,message,interest];
  const handlers = {}, attrs = {};
  const clone = () => ({cloneNode: clone});
  const button = {childNodes:[clone()], disabled:false, textContent:'Send Inquiry', replaceChildren(...nodes) {this.childNodes = nodes; this.textContent = 'Send Inquiry';}};
  let status, timeout, resets = 0, networkCalls = 0;
  const classes = new Set();
  const form = {
    action:'https://formspree.io/f/xreegpav', dataset:{success},
    querySelector(selector) { return selector === '[type="submit"]' ? button : interest; },
    querySelectorAll() {return fields;},
    append(value) {status = value;}, addEventListener(type, handler) {handlers[type] = handler;},
    reportValidity() {return fields.every(f=>!f.validity);},
    setAttribute(key,value) {attrs[key] = value;}, removeAttribute(key) {delete attrs[key];},
    reset() { resets++; name.value = email.value = message.value = ''; interest.value = 'donate'; }
  };
  const document = {
    documentElement:{classList:{remove(){}}}, querySelector(){return null;},
    querySelectorAll(){return [form];},
    createElement() {return {textContent:'',className:'',classList:{add(c){classes.add(c);}}, setAttribute(){}, append(){}};}
  };
  class MockFormData {constructor() {this.entries = fields.map(f=>f.value);}}
  vm.runInNewContext(source, {
    document, window:{location:{search}, matchMedia(){return {};},setTimeout(cb){timeout=cb;return 1;}},
    URLSearchParams, AbortController, FormData:MockFormData, clearTimeout(){},
    fetch(...args) {networkCalls++;return fetchImpl(...args);}
  });
  return {name,email,message,interest,button,attrs,classes,get status(){return status;},get calls(){return networkCalls;},get resets(){return resets;},timeout(){timeout();}, submit(){return handlers.submit({preventDefault(){}});}};
}

(async()=>{
  for (const page of ['index.html','giving.html','community-fund.html']) {
    let resolveRequest, request;
    const form = setup(page, (url, options)=>{request={url,options};return new Promise(r=>{resolveRequest=r;});},'?interest=event');
    assert.equal(form.interest.value,'event');
    const sending = form.submit();
    assert.equal(form.button.disabled,true);
    assert.equal(form.attrs['aria-busy'],'true');
    await form.submit();
    assert.equal(form.calls,1,'double submission must be suppressed');
    assert.equal(request.url,'https://formspree.io/f/xreegpav');
    assert.equal(request.options.method,'POST');
    assert.equal(request.options.headers.Accept,'application/json');
    assert.ok(request.options.signal);
    resolveRequest({ok:true}); await sending;
    assert.equal(form.resets,1);
    assert.equal(form.interest.value,'event');
    assert.equal(form.button.disabled,false);
    assert.equal(form.attrs['aria-busy'],undefined);
    assert.ok(form.classes.has('form-status-success'));
    assert.match(form.status.textContent,/Thank you/);

    for (const failure of [()=>Promise.resolve({ok:false}),()=>Promise.reject(new Error('offline'))]) {
      const f=setup(page,failure); await f.submit();
      assert.equal(f.name.value,'Test User');
      assert.equal(f.message.value,'Local mocked test');
      assert.equal(f.resets,0);
      assert.equal(f.button.disabled,false);
      assert.ok(f.classes.has('form-status-error'));
    }
    const blank=setup(page,()=>{throw new Error('network must not run');});
    blank.name.value='   '; await blank.submit();
    assert.equal(blank.calls,0);
    assert.equal(blank.button.disabled,false);

    const timed=setup(page,(_,options)=>new Promise((_,reject)=>options.signal.addEventListener('abort',()=>{const e=new Error('aborted');e.name='AbortError';reject(e);}))); 
    const waiting=timed.submit();timed.timeout();await waiting;
    assert.match(timed.status.textContent,/before submitting again/);
    assert.equal(timed.name.value,'Test User');
    assert.equal(timed.button.disabled,false);

    const unsafe=setup(page,()=>Promise.resolve({ok:true}),'?interest=%3Cscript%3E');
    assert.equal(unsafe.interest.value,'donate','unknown query values must be ignored');
  }
  console.log('PASS: all three inquiry forms; success, HTTP failure, network failure, timeout, duplicate suppression, whitespace validation, safe topic routing. No network requests sent.');
})().catch(error=>{console.error(error);process.exitCode=1;});
