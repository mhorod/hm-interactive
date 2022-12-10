
function parse_and_apply_substitution()
{
    const input_element = document.getElementById("substitution-application-input");
    const output_element = document.getElementById("substitution-application-output"); 

    const input = input_element.value;
    // split into substitution and type
    const top_level_regex = /^(\{.*\}) (.*)$/; 
    const match = top_level_regex.exec(input);    
    if (match === null || match.length !== 3) {
        output_element.innerHTML = "Invalid input";
        return;
    }

    const substitution = parse_substitution(match[1]);
    const type = parse_type(match[2]);

    if (substitution === null || type === null) {
        output_element.innerHTML = "Invalid syntax";
        return;
    }

    const output = apply_substitution(substitution, type).toString();

    output_element.innerHTML = output;
}

function parse_and_compose_substitutions()
{
    const input_element = document.getElementById("substitution-composition-input");
    const output_element = document.getElementById("substitution-composition-output"); 

    const input = input_element.value;
    // get both substitutions
    const top_level_regex = /^(\{.*\}) (\{.*\})$/;
    const match = top_level_regex.exec(input);

    if (match === null || match.length !== 3) {
        output_element.innerHTML = "Invalid input";
        return;
    }
    const second = parse_substitution(match[1]);
    const first = parse_substitution(match[2]);

    if (second === null || first === null) {
        output_element.innerHTML = "Invalid syntax";
        return;
    }
    
    const output = compose_substitutions(second, first);
    output_element.innerText = substitution_to_string(output);    
}

function substitution_to_string(substitution)
{
    let str = "{";
    for (const [key, value] of substitution) {
        str += key + ": " + value.toString() + ", ";
    }
    str = str.slice(0, -2);
    str += "}";
    return str;
}


const substitution_application_input_element = document.getElementById("substitution-application-input");
substitution_application_input_element.addEventListener("keyup", parse_and_apply_substitution);

const substitution_composition_input_element = document.getElementById("substitution-composition-input");
substitution_composition_input_element.addEventListener("keyup", parse_and_compose_substitutions);

