import { useState, useEffect } from 'react';
import { supabase } from '../../supabase/supabaseClient';
import styles from '../ConcertCalendar/ConcertCalendar.module.css';
import EditConcertModal from '../EditConcertModal/EditConcertModal';
import RespostasModal from '../RespostasModal/RespostasModal';

function googleCalendarUrl(concerto) {
  // Formata data e hora para o formato do Google Calendar: YYYYMMDDTHHmmss
  const data = concerto.data.replace(/-/g, ''); // ex: 20260715

  const horaInicio = concerto.hora_atuacao || concerto.hora_encontro || '120000';
  const horaInicioFmt = horaInicio.replace(/:/g, '').slice(0, 6); // ex: 180000

  // Hora de fim = hora de início + 2h (estimativa)
  const [h, m] = horaInicio.split(':').map(Number);
  const fimH = String((h + 2) % 24).padStart(2, '0');
  const horaFimFmt = `${fimH}${String(m).padStart(2, '0')}00`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: concerto.nome,
    dates: `${data}T${horaInicioFmt}/${data}T${horaFimFmt}`,
    location: concerto.local || '',
    details: [
      concerto.hora_encontro ? `Ponto de encontro: ${concerto.hora_encontro.slice(0, 5)}` : '',
      concerto.hora_refeicao ? `Almoço/Jantar: ${concerto.hora_refeicao.slice(0, 5)}` : '',
      concerto.hora_atuacao ? `Atuação: ${concerto.hora_atuacao.slice(0, 5)}` : '',
    ].filter(Boolean).join('\n'),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function ConcertModal({ concerto, user, isAdmin, onClose, onSaved, onUpdated }) {
  const [presenca, setPresenca] = useState({
    vou: false,
    vou_la_ter: false,
    nao_posso: false,
    vou_almoco_jantar: false,
  });
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showRespostas, setShowRespostas] = useState(false);

  useEffect(() => {
    async function fetchPresenca() {
      const { data } = await supabase
        .from('presencas')
        .select('*')
        .eq('concerto_id', concerto.id)
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPresenca({
          vou: data.vou,
          vou_la_ter: data.vou_la_ter,
          nao_posso: data.nao_posso,
          vou_almoco_jantar: data.vou_almoco_jantar,
        });
      }
      setLoading(false);
    }

    fetchPresenca();
  }, [concerto.id, user.id]);

  function toggle(campo) {
    setPresenca((prev) => ({ ...prev, [campo]: !prev[campo] }));
    setGuardado(false);
  }

  async function handleConfirmar() {
    setGuardando(true);

    const { data: updated, error: updateError } = await supabase
      .from('presencas')
      .update({
        ...presenca,
        atualizado_em: new Date().toISOString(),
      })
      .eq('concerto_id', concerto.id)
      .eq('user_id', user.id)
      .select();

    let error = updateError;

    if (!updateError && updated.length === 0) {
      const { error: insertError } = await supabase
        .from('presencas')
        .insert({
          concerto_id: concerto.id,
          user_id: user.id,
          ...presenca,
          atualizado_em: new Date().toISOString(),
        });
      error = insertError;
    }

    setGuardando(false);

    if (!error) {
      setGuardado(true);
      onSaved(concerto.id, presenca);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <h2 className={styles.modalTitle}>{concerto.nome}</h2>
        <p className={styles.modalLocal}>{concerto.local}</p>
        <p className={styles.modalData}>{concerto.data}</p>

        <div className={styles.modalHoras}>
          {concerto.hora_encontro && (
            <p><strong>Ponto de encontro:</strong> {concerto.hora_encontro.slice(0, 5)}</p>
          )}
          {concerto.hora_refeicao && (
            <p><strong>Almoço/Jantar:</strong> {concerto.hora_refeicao.slice(0, 5)}</p>
          )}
          {concerto.hora_atuacao && (
            <p><strong>Atuação:</strong> {concerto.hora_atuacao.slice(0, 5)}</p>
          )}
        </div>

        {/* Botão Google Calendar */}
        <a
          href={googleCalendarUrl(concerto)}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.googleCalBtn}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 9h18" stroke="currentColor" strokeWidth="2"/>
            <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Adicionar ao Google Calendar
        </a>

        {isAdmin && (
          <div className={styles.adminBar}>
            <button className={styles.linkBtn} onClick={() => setShowEdit(true)}>
              Editar concerto
            </button>
            <button className={styles.linkBtn} onClick={() => setShowRespostas(true)}>
              Ver respostas
            </button>
          </div>
        )}

        {!loading && (
          <>
            <div className={styles.botoes}>
              <button
                className={`${styles.botaoResposta} ${presenca.vou ? styles.ativo : ''}`}
                onClick={() => toggle('vou')}
              >
                Vou
              </button>
              <button
                className={`${styles.botaoResposta} ${presenca.vou_la_ter ? styles.ativo : ''}`}
                onClick={() => toggle('vou_la_ter')}
              >
                Vou lá ter
              </button>
              <button
                className={`${styles.botaoResposta} ${presenca.nao_posso ? styles.ativo : ''}`}
                onClick={() => toggle('nao_posso')}
              >
                Não posso
              </button>
              <button
                className={`${styles.botaoResposta} ${presenca.vou_almoco_jantar ? styles.ativo : ''}`}
                onClick={() => toggle('vou_almoco_jantar')}
              >
                Vou ao almoço/jantar
              </button>
            </div>

            <button
              className={styles.confirmarBtn}
              onClick={handleConfirmar}
              disabled={guardando}
            >
              {guardando ? 'A guardar...' : guardado ? 'Guardado ✓' : 'Confirmar'}
            </button>
          </>
        )}

        {showEdit && (
          <EditConcertModal
            concerto={concerto}
            onClose={() => setShowEdit(false)}
            onUpdated={(novo) => {
              onUpdated(novo);
              setShowEdit(false);
            }}
          />
        )}

        {showRespostas && (
          <RespostasModal
            concerto={concerto}
            onClose={() => setShowRespostas(false)}
          />
        )}
      </div>
    </div>
  );
}

export default ConcertModal;
