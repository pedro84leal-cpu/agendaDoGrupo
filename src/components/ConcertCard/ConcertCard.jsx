import styles from '../ConcertCalendar/ConcertCalendar.module.css';

const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const labels = {
  vou: 'Vou',
  vou_la_ter: 'Vou lá ter',
  nao_posso: 'Não posso',
  vou_almoco_jantar: 'Vou ao almoço/jantar',
};

function ConcertCard({ concerto, presenca, onClick }) {
  const dataObj = new Date(concerto.data + 'T00:00:00');
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = meses[dataObj.getMonth()];

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const passado = dataObj < hoje;

  const respostasAtivas = presenca
    ? Object.keys(labels).filter((k) => presenca[k])
    : [];

  return (
    <div
      className={`${styles.card} ${passado ? styles.passado : ''}`}
      onClick={onClick}
    >
      <div className={styles.dateBox}>
        <span className={styles.dia}>{dia}</span>
        <span className={styles.mes}>{mes}</span>
      </div>
      <div className={styles.info}>
        <p className={styles.nome}>{concerto.nome}</p>
        <p className={styles.local}>{concerto.local}</p>
        {respostasAtivas.length > 0 && (
          <p className={styles.minhaResposta}>
            {respostasAtivas.map((k) => labels[k]).join(' · ')}
          </p>
        )}
      </div>
      <div className={styles.hora}>
        {passado ? 'passado' : (concerto.hora_atuacao?.slice(0, 5) || '')}
      </div>
    </div>
  );
}

export default ConcertCard;