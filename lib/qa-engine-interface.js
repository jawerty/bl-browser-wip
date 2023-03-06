const path = require('path');
const spawn = require('child_process').spawn;

class QAEngineInterface {
    constructor() {

    }

    initQAModel() {
        return new Promise((resolve) => {
            const child = spawn('python', [`${path.join(__dirname, '/../qa-engine/init_qa_pipeline.py')}`]);

            // You can also use a variable to save the output 
            // for when the script closes later
            let scriptOutput = "";

            child.stdout.setEncoding('utf8');
            child.stdout.on('data', function(data) {
                //Here is where the output goes

                console.log('stdout: ' + data);

                data=data.toString();
                scriptOutput+=data;
            });

            child.stderr.setEncoding('utf8');
            child.stderr.on('data', function(data) {
                //Here is where the error output goes

                console.log('stderr: ' + data);

                data=data.toString();
                scriptOutput+=data;
            });

            child.on('close', function(code) {
                //Here you can get the exit code of the script

                console.log('LOAD MODEL OUTPUT code: ' + code);
                console.log('LOAD MODEL OUTPUT: ',scriptOutput);
                
                resolve()
            });     
        })

        
        
    }

    askQuestion(question, linkURL, depth) {
        return new Promise((resolve) => {
            const options = [`${path.join(__dirname, '/../qa-engine/ask_question.py')}`, `"${question}"`]
            if (linkURL) {
                options.push( '--link')
                options.push(`"${linkURL}"`)
            }
            if (depth) {
                options.push( '--depth')
                options.push(`${depth}`)
            }
            const child = spawn('python', options);

            // You can also use a variable to save the output 
            // for when the script closes later
            let scriptOutput = "";

            child.stdout.setEncoding('utf8');
            child.stdout.on('data', function(data) {
                //Here is where the output goes

                console.log('stdout: ' + data);

                data=data.toString();
                scriptOutput+=data;
            });

            child.stderr.setEncoding('utf8');
            child.stderr.on('data', function(data) {
                //Here is where the error output goes

                console.log('stderr: ' + data);

                data=data.toString();
                scriptOutput+=data;
            });

            child.on('close', function(code) {
                //Here you can get the exit code of the script

                console.log('QA QUESTION OUTPUT code: ' + code);
                console.log('QA QUESTION OUTPUT: ',scriptOutput);
                const endTag = 'QAPIPELINE:';
                const cutoffIndex = scriptOutput.indexOf(endTag);
                let answer = null;
                if (cutoffIndex > -1) {
                    answer = scriptOutput.slice(cutoffIndex + endTag.length).trim()
                }
                resolve(answer)
            });
        });
        
    }

    basicQuery(query, linkURL, depth) {
        return new Promise((resolve) => {
            const options = [`${path.join(__dirname, '/../qa-engine/basic_query.py')}`, `"${query}"`]
            if (linkURL) {
                options.push( '--link')
                options.push(`"${linkURL}"`)
            }
            if (depth !== null || typeof depth !== 'undefined') {
                options.push('--depth')
                options.push(`${depth}`)
            }
            const child = spawn('python', options);

            // You can also use a variable to save the output 
            // for when the script closes later
            let scriptOutput = "";

            child.stdout.setEncoding('utf8');
            child.stdout.on('data', function(data) {
                //Here is where the output goes

                console.log('stdout: ' + data);

                data=data.toString();
                scriptOutput+=data;
            });

            child.stderr.setEncoding('utf8');
            child.stderr.on('data', function(data) {
                //Here is where the error output goes

                console.log('stderr: ' + data);

                data=data.toString();
                scriptOutput+=data;
            });

            child.on('close', function(code) {
                //Here you can get the exit code of the script

                console.log('BASIC QUERY OUTPUT code: ' + code);
                console.log('BASIC QUERY OUTPUT: ',scriptOutput);
                const endTag = 'BASICQUERY_PIPELINE:';
                const cutoffIndex = scriptOutput.indexOf(endTag);
                let results = [];
                if (cutoffIndex > -1) {
                    try {
                        results = JSON.parse(scriptOutput.slice(cutoffIndex + endTag.length).trim())
                    } catch(e) {
                        console.log(e)
                        // swallow error
                    }
                }
                console.log("results", results)
                resolve(results)
            });
        });
        
    }
}


module.exports = QAEngineInterface