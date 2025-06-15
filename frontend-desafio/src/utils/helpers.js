export function formatarCPF(cpf) {
    const onlyDigits = cpf.replace(/\D/g, '').padStart(11, '0');
    return onlyDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}