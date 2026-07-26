export default function InputError({ message, id, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            id={id}
            role="alert"
            className={'text-sm text-red-600 dark:text-red-400 ' + className}
        >
            {message}
        </p>
    ) : null;
}
