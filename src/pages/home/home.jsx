import ConcertCalendar from '../../components/ConcertCalendar/ConcertCalendar'
import styles from '../home/home.module.css'


function Home(){

    return(
        <>
        <section className={styles.container}>
            <ConcertCalendar />
        </section>
        </>

    )
}

export default Home