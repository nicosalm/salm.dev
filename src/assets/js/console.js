const art = [
    "            __          __",
    "  ___ ___ _/ /_ _   ___/ /__ _  __",
    " (_-</ _ `/ /  ' \\_/ _  / -_) |/ /",
    "/___/\\_,_/_/_/_/_(_)_,_/\\__/|___/",
];

const width = Math.max(...art.map((line) => line.length));
let format = "";
const styles = [];
for (const line of art) {
    for (let i = 0; i < line.length; i++) {
        format += `%c${line[i]}`;
        styles.push(`color: hsl(${(i / width) * 360}, 90%, 60%); font-weight: bold`);
    }
    format += "\n";
}
console.log(
    `${format}\n%cHello there! You can find this website's source at https://github.com/nicosalm/salm.dev`,
    ...styles,
    "",
);
