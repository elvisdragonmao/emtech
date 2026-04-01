const icons = {
	log: "➤",
	info: "➤",
	warn: "⚠️",
	success: "✅",
	error: "❌"
} as const;

const colors = {
	log: 37,
	info: 34,
	warn: 33,
	success: 35,
	message: 32,
	error: 31
} as const;

type LogType = keyof typeof colors;

export const log = (type: LogType, message: string) => {
	const icon = icons[type as keyof typeof icons] ?? icons.log;
	const color = colors[type] ?? colors.log;
	console.log(`\x1b[${color}m%s\x1b[0m`, `${icon} ${message}`);
};

export const printBanner = () => {
	console.log(
		"\x1b[33m%s\x1b[0m",
		`  
         ##         
        ####        
 ######      ###### 
  ######    ######  
    #### ## ####    
    #   #  #   #    
  ####  ####  ####  
 ################## 
        ####        
         ##                                                                
`
	);
};
