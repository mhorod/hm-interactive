class TypeVariable {
    static variables_made = 0;
    constructor(name) {
        this.name = name;
    }
    static new() {
        return new TypeVariable(`t${TypeVariable.variables_made++}`);
    }

    toString() {
        return `${this.name}`;
    }
}

class FunctionType {
    constructor(arg_type, return_type) {
        this.arg_type = arg_type;
        this.return_type = return_type;
    }
    toString() {
        return `(${this.arg_type} -> ${this.return_type})`;
    }
}

class PrimitiveType {
    constructor(name) {
        this.name = name;
    }

    toString() {
        return `${this.name}`;
    }
}

class TypeScheme {
    constructor(constraints, type) {
        this.constraints = constraints;
        this.type = type;
    }

    toString() {
        return `${this.constraints.join(" => ")} => ${this.type}`;
    }
}




class Literal {
    constructor(value) {
        this.value = value;
    }
}

class Lambda {
    constructor(arg_name, body) {
        this.arg_name = arg_name
        this.body = body;
    }
}

class Application {
    constructor(func, arg) {
        this.func = func;
        this.arg = arg;
    }
}



function infer(context, expression) {
    if (expression instanceof Lambda) {
        return infer_lambda(context, expression.arg_name, expression.body)
    }
}

function infer_lambda(context, arg, body) {
    // Copy the context and add type of the arg
    const body_context = new Map(context);
    const arg_type = new TypeScheme([], TypeVariable.new()); 
    body_context.set(arg_name, arg_type)

    // Infer the body
    const body_type = infer(body_context, body);

    // The result is the function type of arg -> body    
    return new FunctionType(arg_type, body_type);
}

function apply_substitution(substitution, type)
{
    if (type instanceof PrimitiveType)
        return type;
    else if (type instanceof TypeVariable)
    {
        if (substitution.has(type.name))
            return substitution.get(type.name);
        else
            return type;
    }
    else if (type instanceof FunctionType) {
        const new_arg_type = apply_substitution(substitution, type.arg_type);
        const new_return_type = apply_substitution(substitution, type.return_type);
        return new FunctionType(new_arg_type, new_return_type);
    }
    else if (type instanceof TypeScheme)
    {
        const pruned_substitution = new Map();
        for (const [key, value] of substitution)
            if (!type.constraints.includes(key))
                pruned_substitution.set(key, value);

        const applied_type = apply_substitution(pruned_substitution, type.type);
        return new TypeScheme(type.constraints, applied_type);
    }
    else
        throw new Error("Unknown type: " + type);
}

function compose_substitutions(second, first)
{
    const composed = new Map();
    for (const [key, value] of first)
        composed.set(key, apply_substitution(second, value));
    for (const [key, value] of second)
        if (!composed.has(key))
            composed.set(key, value);
    return composed;    
}