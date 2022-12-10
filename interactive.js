
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

const substitution_application_input_element = document.getElementById("substitution-application-input");
substitution_application_input_element.addEventListener("keyup", parse_and_apply_substitution);
