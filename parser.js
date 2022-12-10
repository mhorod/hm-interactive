
function parse_substitution(str)
{
    // remove whitespace
    str = str.replace(/\s/g, '');
    // strip outer braces
    str = str.replace(/^\{(.*)\}$/, '$1');

    const substitution = new Map();

    const pairs = str.split(",");
    for (const pair of pairs) {
        const [key, value] = pair.split(":");
        if (key === undefined || value === undefined)
            return null;
        const type = parse_type(value);
        if (type === null)
            return null;
        substitution.set(key, type);
    }


    return substitution;
}

function parse_type(str)
{
    // remove whitespace
    str = str.replace(/\s/g, '');
    
    let paren_tree = parse_paren_tree(str);
    if (paren_tree === null)
        return null;

    paren_tree = separate_arrows(paren_tree);
    return parse_type_from_paren_tree(paren_tree);
}

function parse_paren_tree(str) {
    const top_level = [];
    let current_string = "";
    let previous_level = top_level;
    let current_level = top_level;

    let open = 0;
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c !== '(' && c !== ')') {
            current_string += c;
            continue;
        }

        if (current_string !== "")
            current_level.push(current_string);
        current_string = "";

        if (c === '(') {
            open++;
            const new_level = [];
            current_level.push(new_level);
            previous_level = current_level;
            current_level = new_level;
        } else {
            if (open === 0)
                return null;
            open--;
            current_level = previous_level;
        }
    }

    if (open !== 0)
        return null;

    if (current_string !== "")
        current_level.push(current_string);

    return top_level;
}

function parse_type_from_paren_tree(paren_tree)
{
    if (paren_tree.length === 0)
        return null;

    if (paren_tree.includes("=>"))
        return scheme_from_paren_tree(paren_tree);
    else if (paren_tree.includes("->"))
        return function_from_paren_tree(paren_tree);

    if (paren_tree.length === 1) {
        if (Array.isArray(paren_tree[0]))
            return parse_type_from_paren_tree(paren_tree[0]);
        const str = paren_tree[0];
        if (is_primitive_type(str))
            return new PrimitiveType(str);
        else
            return new TypeVariable(str);
    }
    return null;
}

function scheme_from_paren_tree(paren_tree)
{
    const scheme_params = get_scheme_params(paren_tree);
    if (scheme_params == null)
        return null;

    const last_arrow = paren_tree.lastIndexOf("=>");
    
    const scheme_right = paren_tree.slice(last_arrow + 1);
    const scheme_type = parse_type_from_paren_tree(scheme_right);

    if (scheme_type === null)
        return null;
    
    return new TypeScheme(scheme_params, scheme_type);
}

function function_from_paren_tree(paren_tree)
{
    const first_arrow = paren_tree.findIndex(x => x === "->");
    if (first_arrow === -1)
        return null;

    const left = paren_tree.slice(0, first_arrow);
    const right = paren_tree.slice(first_arrow + 1);
    const left_type = parse_type_from_paren_tree(left);
    const right_type = parse_type_from_paren_tree(right);

    if (left_type === null || right_type === null)
        return null;

    return new FunctionType(left_type, right_type);
}

function get_scheme_params(paren_tree)
{
    const params = [];
    const first_arrow = paren_tree.findIndex(x => x === "=>");
    if (first_arrow === -1)
        return params;
    
    const left = paren_tree.slice(0, first_arrow);
    const right = paren_tree.slice(first_arrow + 1);

    if (left.length === 0 || left.length > 1 || Array.isArray(left[0]))
        return null;
    
    params.push(left[0]);
    const right_params = get_scheme_params(right);
    if (right_params === null)
        return null;
    params.push(...right_params);
    return params;
}

function separate_arrows(paren_tree)
{
    const result =[];
    for (let i = 0; i < paren_tree.length; i++) {
        const element = paren_tree[i];
        if (Array.isArray(element))
            result.push(separate_arrows(element));
        else
        {
            // split on -> or => and add the arrow back
            const split = element
                .replace(/->/g, " -> ")
                .replace(/=>/g, " => ")
                .split(" ")
                .filter(x => x !== "");
            result.push(...split);
        }
    }
    return result;
}

function is_primitive_type(str)
{
    return str === "Int" || str === "Bool";
}