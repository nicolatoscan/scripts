import fs from 'fs'

function main(folder, code, run) {
  // list all files in the folder with full path
  const files = fs.readdirSync(folder).map(file => ({
    fullname: file,
    extension: file.split('.').pop(),
    name: file.split('.').slice(0, -1).join('.'),
    time: fs.statSync(`${folder}/${file}`).mtime
  }))

  // log number of files by extension
  const exts = {};
  files.forEach(f => {
    if (!exts[f.extension]) exts[f.extension] = 0;
    exts[f.extension]++;
  })
  console.log('Number of files by extensions: ', exts);
  console.log('');

  const groupNames = {};
  for (const f of files) {
    if (!groupNames[f.name]) groupNames[f.name] = [];
    groupNames[f.name].push(f);
  }

  const groupDates = {};
  for (const name in groupNames) {
    const x = groupNames[name][0].time.toISOString().replace(/[-:]/g, '').replace('T', '_').replace(/\..+/, '');
    if (!groupDates[x]) groupDates[x] = [];
    groupDates[x].push(groupNames[name]);
  }

  for (const date in groupDates) {
    groupDates[date].forEach((x, i) => {
      const newFilesname = `${code}_${date}_${i.toString().padStart(3, '0')}`;
      x.forEach(y => { y.newFilename = `${newFilesname}.${y.extension}`; })
    })
  }

  if (new Set(files.map(f => f.newFilename)).size !== files.length) {
    console.log('Error: Duplicate filenames')
    return
  }
  
  for (const f of files) {
    console.log(`Renaming ${f.fullname}\t to ${f.newFilename}`)
    if (run) fs.renameSync(`${folder}/${f.fullname}`, `${folder}/${f.newFilename}`);
  }
  if (!run) console.log('\nRun with "Y" as third argument to rename files')
}

const folder = process.argv[2];
const code = process.argv[3];
const run = process.argv[4] === 'Y';

if (!folder || !code) {
  console.log('Usage: node rename.js <folder> <code> [Y]')
  console.log('  folder: folder containing files to rename')
  console.log('  code: code to prefix the new filenames')
  console.log('  Y: run the script')
} else {
  main(folder, code,run)
}