const fs = require('fs');
let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const oldSpan = `<span className="font-display text-5xl sm:text-7xl lg:text-8xl leading-none">
                    {item.label}
                  </span>`;

const newSpan = `{item.art ? (
                    <img
                      src={item.art}
                      alt={item.label}
                      className={\`h-7 xs:h-9 sm:h-12 md:h-16 lg:h-20 w-auto object-contain transition-all duration-150 \${
                        isOpen ? 'brightness-110 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]' : 'opacity-90 hover:opacity-100'
                      }\`}
                    />
                  ) : (
                    <span className="font-display text-5xl sm:text-7xl lg:text-8xl leading-none">
                      {item.label}
                    </span>
                  )}`;

if (home.includes(oldSpan)) {
  home = home.replace(oldSpan, newSpan);
  fs.writeFileSync('src/pages/Home.tsx', home);
  console.log('Home.tsx updated with tribal menu artwork!');
} else {
  console.log('Home.tsx span pattern not found');
}
