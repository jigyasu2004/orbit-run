import {mkdir,copyFile,access} from 'node:fs/promises';
await access('dist/client/race.html');
await mkdir('dist/client/race',{recursive:true});
await copyFile('dist/client/race.html','dist/client/race/index.html');
await copyFile('dist/client/race.rsc','dist/client/race/index.rsc');
console.log('Racing page exported and verified for directory-based hosting.');
