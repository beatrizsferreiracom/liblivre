from datetime import date, timedelta
import holidays

def calcular_data_devolucao(data_base: date, dias_prazo: int = 15) -> date:
    """
    Calcula a data de devolução somando os dias de prazo
    Se cair em um fim de semana ou feriado nacional, joga para o próximo dia útil
    """

    data_prevista = data_base + timedelta(days=dias_prazo)

    feriados_nacionais = holidays.country_holidays('BR')

    while data_prevista.weekday() in [5, 6] or data_prevista in feriados_nacionais:
        data_prevista += timedelta(days=1)

    return data_prevista